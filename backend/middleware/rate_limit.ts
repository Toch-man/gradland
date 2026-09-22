import rateLimit from "express-rate-limit";
import { success } from "zod";

export const auth_limiter = rateLimit({
  windowMs: 15 * 60 * 1000, //15mins
  max: 10, // 10 attempts per ip window
  message: {
    success: false,
    message: "too many attempts please try again in few minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const ai_limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message:
      "You've hit the hourly limit for opportunity matching. Try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const general_limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
