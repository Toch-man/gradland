import crypto from "crypto";
import jwt from "jsonwebtoken";
import { redis } from "./redis";

export const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

export function createRefreshToken(
  userId: string,
  email: string,
): {
  token: string;
  jti: string;
} {
  const jti = crypto.randomBytes(32).toString("hex");

  const token = jwt.sign(
    {
      user_id: userId,
      email,
      jti,
    },
    process.env.REFRESH_SECRET!,
    { expiresIn: "7d" },
  );

  return { token, jti };
}

export async function storeRefreshTokenSession(jti: string): Promise<void> {
  await redis.set(`refresh:${jti}`, "valid", "EX", REFRESH_TOKEN_TTL_SECONDS);
}

export async function deleteRefreshTokenSession(jti: string): Promise<void> {
  await redis.del(`refresh:${jti}`);
}
