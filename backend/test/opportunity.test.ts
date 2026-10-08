import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  test,
  vi,
} from "vitest";
import app from "../app";
import mongoose from "mongoose";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { recommend_opportunity } from "../controllers/opportunity_controller";
import { redis } from "../lib/redis";
import User from "../models/user_model";
import Opportunity from "../models/opportunity_model";
import * as opportunityAi from "../ai/get_path";
import {
  extractTavilyResults,
  normalizeModelMatches,
  persistNewLiveMatches,
} from "../ai/get_path";
const test_user = {
  full_name: "Test User",
  email: "test@example.com",
  password: "password123",
  date_of_birth: "1999-01-01",
  age: 22,
  status: "STUDENT",
};

let mongo_server: MongoMemoryServer;

beforeAll(async () => {
  mongo_server = await MongoMemoryServer.create();
  await mongoose.connect(mongo_server.getUri());
}, 30000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongo_server) {
    await mongo_server.stop();
  }
});

afterEach(async () => {
  vi.restoreAllMocks();
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe("GET,/api/opportunity/recommend", () => {
  test("Can recommend opportunities", async () => {
    const agent = request.agent(app);
    await agent.post("/api/auth/sign_up").send(test_user);
    const res = await agent.get("/api/opportunity/recommend");
    console.log("RES BODY:", res.body);

    expect(res.statusCode).toBe(400);

    expect(res.body.requires_goals).toBe(true);
  });

  test("returns match once goals are set", async () => {
    const agent = request.agent(app);
    vi.spyOn(opportunityAi, "discover_new_opportunities").mockResolvedValue([
      {
        title: "Fresh scholarship",
        source: "DATABASE",
        eligibility_status: "ELIGIBLE",
        fit_score: 90,
        reasoning: "Good fit",
        program_overview: "Overview",
        application_strategy: "Apply now",
        gaps: [],
      },
    ] as any);

    const signupRes = await agent.post("/api/auth/sign_up").send(test_user);
    console.log("SIGNUP STATUS:", signupRes.status, signupRes.body);
    await agent
      .patch("/api/user/update_goals")
      .send({ goals: ["SCHOLARSHIP"] });

    const res = await agent.get("/api/opportunity/recommend");
    console.log("RES BODY:", res.body);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty("data");
  }, 30000);

  test("normalizes wrapped Tavily results and validates database ids", () => {
    const dbIds = new Set(["real-db-id"]);

    const matches = [
      {
        opportunity_id: "real-db-id",
        title: "Real DB scholarship",
        source: "DATABASE",
        eligibility_status: "ELIGIBLE",
        fit_score: 91,
        reasoning: "Strong match",
        program_overview: "Real overview",
        application_strategy: "Apply now",
        gaps: [],
      },
      {
        opportunity_id: "fake-db-id",
        title: "Fake DB scholarship",
        source: "DATABASE",
        eligibility_status: "WORKABLE",
        fit_score: 82,
        reasoning: "Should be dropped",
        program_overview: "Fake",
        application_strategy: "Nope",
        gaps: [],
      },
      {
        title: "Live scholarship",
        source: "LIVE_SEARCH",
        eligibility_status: "WORKABLE",
        fit_score: 80,
        reasoning: "Good live option",
        program_overview: "Live overview",
        application_strategy: "Apply this month",
        gaps: [
          {
            criterion: "Need transcript",
            is_fixable: true,
            how_to_close: "Upload transcript",
          },
        ],
      },
    ];

    const normalized = normalizeModelMatches(matches, dbIds);

    expect(normalized).toHaveLength(2);
    expect(normalized[0].opportunity_id).toBe("real-db-id");
    expect(normalized.some((m) => m.title === "Live scholarship")).toBe(true);
    expect(normalized.some((m) => m.title === "Fake DB scholarship")).toBe(
      false,
    );
  });

  test("extracts result arrays from wrapped Tavily responses", () => {
    const results = [
      { query: "first", results: [{ title: "One" }, { title: "Two" }] },
      { query: "second", results: [{ title: "Three" }] },
    ];

    expect(extractTavilyResults(results)).toHaveLength(3);
    expect(extractTavilyResults(results).map((r) => r.title)).toEqual([
      "One",
      "Two",
      "Three",
    ]);
  });

  test("persists live-search matches into the Opportunity collection", async () => {
    type MatchShape = {
      title: string;
      source: string;
      type: string;
      eligibility_status: string;
      fit_score: number;
      reasoning: string;
      program_overview: string;
      application_strategy: string;
      gaps: any[];
      opportunity_id?: string;
    };

    const matches: MatchShape[] = [
      {
        title: "Live scholarship example",
        source: "LIVE_SEARCH",
        type: "SCHOLARSHIP",
        eligibility_status: "WORKABLE",
        fit_score: 85,
        reasoning: "Promising live result",
        program_overview: "A government-funded award",
        application_strategy:
          "Apply with your transcript and statement of intent",
        gaps: [],
      },
    ];

    await persistNewLiveMatches(matches);

    const saved = await Opportunity.findOne({
      title: { $regex: "^Live scholarship example$", $options: "i" },
    });

    expect(saved).toBeTruthy();
    expect(matches[0].source).toBe("DATABASE");
    expect(matches[0].opportunity_id).toBe(saved!._id.toString());
  });

  test("invalidates empty cache and refreshes recommendations", async () => {
    vi.spyOn(User, "findOne").mockResolvedValue({
      _id: "user-123",
      email: "test@example.com",
      goals: ["SCHOLARSHIP"],
    } as any);
    vi.spyOn(redis, "get").mockResolvedValue("[]");
    vi.spyOn(redis, "del").mockResolvedValue(1 as any);
    const discoverSpy = vi
      .spyOn(opportunityAi, "discover_new_opportunities")
      .mockResolvedValue([
        {
          title: "Fresh scholarship",
          source: "DATABASE",
          eligibility_status: "ELIGIBLE",
          fit_score: 90,
          reasoning: "Good fit",
          program_overview: "Overview",
          application_strategy: "Apply now",
          gaps: [],
        },
      ] as any);

    const req = { user: { email: "test@example.com" } } as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as any;

    await recommend_opportunity(req, res);

    expect(redis.del).toHaveBeenCalledWith("recommendations:user-123");
    expect(discoverSpy).toHaveBeenCalledWith(
      expect.objectContaining({ _id: "user-123", email: "test@example.com" }),
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({ title: "Fresh scholarship" }),
        ]),
      }),
    );
  });
});
