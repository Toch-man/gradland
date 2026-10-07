import { Request, Response } from "express";
import User from "../models/user_model";
import { discover_new_opportunities } from "../ai/get_path";
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

    const cacheKey = `recommendations:${user._id}`;

    // 1. Try the cache first — this is what the daily cron keeps filled in.
    // Empty arrays are treated as a cache miss so we refresh and re-seed.
    const cached = await redis.get(cacheKey);
    if (cached !== null) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return res.status(200).json({
            success: true,
            message: "opportunities fetched successfully",
            data: parsed,
          });
        }

        await redis.del(cacheKey);
      } catch {
        await redis.del(cacheKey);
      }
    }

    // 2. No valid cache yet — this is the fresh-user path. Do the live
    // discovery pass once, then cache only meaningful results.
    const opportunities = await discover_new_opportunities(user);

    if (Array.isArray(opportunities) && opportunities.length > 0) {
      await redis.set(
        cacheKey,
        JSON.stringify(opportunities),
        "EX",
        CACHE_TTL_SECONDS,
      );
    } else {
      await redis.del(cacheKey);
    }

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
