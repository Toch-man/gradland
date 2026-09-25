import { Request, Response } from "express";
import User from "../models/user_model";
import { fetch_opportunities } from "../ai/get_path";
import { redis } from "../lib/redis";
import { jwtPayload } from "../middleware/auth_middleware";

const CACHE_TTL_SECONDS = 26 * 60 * 60; // just over a day — outlives the daily cron gap

export const recommend_opportunity = async (req: Request, res: Response) => {
  const email = (req.user! as jwtPayload).email;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "user not found" });
    }

    if (!user.goals || user.goals.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please set your goals before we can recommend opportunities",
        requires_goals: true,
      });
    }

    // 1. Try the cache first — this is what the daily cron keeps filled in.
    // No AI call, no database query beyond this one Redis lookup.
    const cached = await redis.get(`recommendations:${user._id}`);
    if (cached) {
      return res.status(200).json({
        success: true,
        message: "opportunities fetched successfully",
        data: JSON.parse(cached),
      });
    }

    // 2. Nothing cached yet — this only happens for a brand-new user who
    // hasn't had a cron run overnight yet. Compute once, live, then cache
    // it so every request after this one hits the fast path above instead.
    const opportunities = await fetch_opportunities(user);
    await redis.set(
      `recommendations:${user._id}`,
      JSON.stringify(opportunities),
      "EX",
      CACHE_TTL_SECONDS,
    );

    return res.status(200).json({
      success: true,
      message: "opportunities fetched successfully",
      data: opportunities,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "internal server error",
      error: error.message,
    });
  }
};
