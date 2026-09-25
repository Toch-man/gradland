import { afterAll, beforeAll, afterEach, describe, expect, test } from "vitest";
import app from "../app";
import mongoose from "mongoose";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
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

  test("returns mathch once goals are set", async () => {
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
});
