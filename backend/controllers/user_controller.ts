import { Request, Response } from "express";
import User from "../models/user_model";

const validGoals = [
  "SCHOLARSHIP",
  "INTERNSHIP",
  "JOB",
  "GRADUATE_SCHOOL",
  "ADMISSION_ABROAD",
];

// GET /profile — the logged-in user's own data
export const get_profile = async (req: Request, res: Response) => {
  const email = req.user!.email;
  try {
    const user = await User.findOne({ email }).select("-password -token");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "user not found" });
    }
    return res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "internal server error" });
  }
};

// PATCH /profile — edit general profile fields
export const update_profile = async (req: Request, res: Response) => {
  const email = req.user!.email;
  try {
    // Whitelist what's editable here — never let req.body overwrite
    // email, password, token, or _id directly through this route
    const allowed = [
      "full_name",
      "age",
      "status",
      "school",
      "course_of_study",
      "current_grade",
      "skill",
      "preferred_countries",
    ];
    const updates: Record<string, any> = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const user = await User.findOneAndUpdate({ email }, updates, {
      new: true,
    }).select("-password -token");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "user not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "profile updated", data: user });
  } catch (error: any) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "internal server error" });
  }
};

// PATCH /profile/goals — already yours, just fixed
export const update_goals = async (req: Request, res: Response) => {
  const email = req.user!.email;
  try {
    const { goals } = req.body;

    if (
      !Array.isArray(goals) ||
      goals.length === 0 ||
      !goals.every((g) => validGoals.includes(g))
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid, non-empty list of goals",
      });
    }

    const user = await User.findOneAndUpdate(
      { email },
      { goals },
      { new: true },
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "user not found" });
    }

    return res.status(200).json({
      success: true,
      message: "goals updated",
      data: user.goals,
    });
  } catch (error: any) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "internal server error" });
  }
};
