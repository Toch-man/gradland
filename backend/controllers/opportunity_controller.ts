import { Request, Response } from "express";
import { fetch_opportunities } from "../ai/get_path";
import User from "../models/user_model";
import { jwtPayload } from "../middleware/auth_middleware";

export const recommend_path = async (req: Request, res: Response) => {
  const email = req.user!.email;
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

    const opportunities = await fetch_opportunities(user);

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
