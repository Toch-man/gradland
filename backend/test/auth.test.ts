import request from "supertest";
import app from "../app";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock modules that hit external services or the DB
vi.mock("../models/user_model", () => {
  // Mock constructor and static findOne
  const MockUser: any = function (data: any) {
    this._id = "mockid";
    this.email = data.email;
    this.save = vi.fn().mockResolvedValue({ _id: "mockid", email: data.email });
  };
  MockUser.findOne = vi.fn();
  return { default: MockUser };
});

vi.mock("../lib/redis", () => ({
  redis: {
    set: vi.fn().mockResolvedValue("OK"),
    get: vi.fn().mockResolvedValue(null),
    del: vi.fn().mockResolvedValue(1),
  },
}));

vi.mock("../lib/hash_token", () => ({
  default: (t: string) => t,
}));

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashedpass"),
    compare: vi.fn().mockResolvedValue(true),
  },
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: (payload: any) => "signed-token",
    verify: vi.fn().mockImplementation((token: string) => {
      // return a decoded payload for refresh_token
      return { user_id: "mockid", email: "a@b.com" };
    }),
    TokenExpiredError: class TokenExpiredError extends Error {},
  },
}));

import User from "../models/user_model";
import { redis } from "../lib/redis";
import bcrypt from "bcrypt";

beforeEach(() => {
  process.env.ACCESS_SECRET = "access_secret";
  process.env.REFRESH_SECRET = "refresh_secret";
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("Auth endpoints", () => {
  it("signs up a new user", async () => {
    // @ts-ignore
    User.findOne.mockResolvedValueOnce(null);

    const res = await request(app).post("/api/auth/sign_up").send({
      full_name: "Test User",
      email: "test@example.com",
      password: "password123",
      age: 20,
      status: "STUDENT",
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body).toHaveProperty("message");
  });

  it("fails login with invalid credentials", async () => {
    // @ts-ignore
    User.findOne.mockResolvedValueOnce(null);

    const res = await request(app).post("/api/auth/log_in").send({
      email: "noone@example.com",
      password: "bad",
    });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("success", false);
  });

  it("logs in successfully", async () => {
    // return a user object with password
    const fakeUser = {
      _id: "mockid",
      email: "a@b.com",
      password: "hashedpass",
    };
    // @ts-ignore
    User.findOne.mockResolvedValueOnce(fakeUser);
    // @ts-ignore
    (bcrypt.compare as any).mockResolvedValueOnce(true);

    const res = await request(app).post("/api/auth/log_in").send({
      email: "a@b.com",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
  });

  it("refreshes token when valid refresh token cookie provided", async () => {
    // mock jwt.verify to return decoded payload (done in mock above)
    // mock redis.get to return the same token as hash_token (hash_token mocked to identity)
    (redis.get as any).mockResolvedValueOnce("refresh-token-value");
    // ensure User.findOne returns a user
    // @ts-ignore
    User.findOne.mockResolvedValueOnce({ _id: "mockid", email: "a@b.com" });

    const res = await request(app)
      .post("/api/auth/refresh_token")
      .set("Cookie", ["refresh_token=refresh-token-value"])
      .send();

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body).toHaveProperty("message", "token refreshed");
  });

  it("logs out (no refresh cookie)", async () => {
    const res = await request(app).post("/api/auth/logout").send();
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
  });
});
