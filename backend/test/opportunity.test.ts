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
import * as opportunityAi from "../ai/get_path";
const test_user = {
  full_name: "Test User",
  email: "test@example.com",
  password: "password123",
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
