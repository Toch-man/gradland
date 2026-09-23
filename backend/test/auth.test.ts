import request from "supertest";
import app from "../app";
import mongoose from "mongoose";
import User from "../models/user_model";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
const test_user = { email: "test@example.com", password: "password123" };

let mongo_server: MongoMemoryServer;
beforeAll(async () => {
  mongo_server = await MongoMemoryServer.create();
  await mongoose.connect(mongo_server.getUri());
});

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

describe("POST /auth/sign_up", () => {
  test("should register new user  successfully", async () => {
    const res = await request(app).post("auth/sign_up").send(test_user);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty("data");
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  test("should existing user sign up", async () => {
    const res = await request(app).post("auth/sign_up").send(test_user);

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test("should reject user with missing fields", async () => {
    const res = await request(app)
      .post("auth/sign_up")
      .send({ email: "test_user@example.com" });

    expect(res.statusCode).toBe(500);
  });
});

//login

describe("POST /auth/log_in", () => {
  test("can user login", async () => {
    const res = await request(app).post("auth/log_in").send(test_user);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty("data");
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  test("can user login with wrong password", async () => {
    const res = await request(app)
      .post("auth/log_in")
      .send({ ...test_user, password: "hello world" });

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
