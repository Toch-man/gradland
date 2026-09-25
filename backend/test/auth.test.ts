import request from "supertest";
import app from "../app";
import mongoose from "mongoose";
import { beforeAll, afterAll, afterEach, test, describe, expect } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";

export const test_user = {
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
  await mongo_server.stop();
});

afterEach(async () => {
  // wipe all collections between individual tests, not just at the very end —
  // keeps each test isolated from what the previous one created
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe("POST /api/auth/sign_up", () => {
  test("should register new user  successfully", async () => {
    const res = await request(app).post("/api/auth/sign_up").send(test_user);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty("data");
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  test("should existing user sign up", async () => {
    await request(app).post("/api/auth/sign_up").send(test_user);

    const res = await request(app).post("/api/auth/sign_up").send(test_user);
    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test("should reject user with missing fields", async () => {
    const res = await request(app)
      .post("/api/auth/sign_up")
      .send({ email: test_user.email });

    expect(res.statusCode).toBe(500);
  });
});

//login

describe("POST /api/auth/log_in", () => {
  test("can user login", async () => {
    await request(app).post("/api/auth/sign_up").send(test_user);

    const res = await request(app)
      .post("/api/auth/log_in")
      .send({ email: test_user.email, password: test_user.password });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty("data");
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  test("can user login with wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/log_in")
      .send({ ...test_user, password: "hello world" });

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
