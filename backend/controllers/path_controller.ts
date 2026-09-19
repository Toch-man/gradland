import { Request, Response } from "express";
import Path from "../models/path_model";
import User from "../models/user_model";

// POST /paths — user clicks "Prepare for this scholarship"
export const create_path = async (req: Request, res: Response) => {
  const email = req.user!.email;
  try {
    const { opportunity_id, title, description, gaps } = req.body;

    if (!opportunity_id || !Array.isArray(gaps)) {
      return res.status(400).json({
        success: false,
        message: "opportunity_id and gaps are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "user not found" });
    }

    // Only fixable gaps become milestones — an unfixable one (e.g. age)
    // has nothing for the user to check off, so don't clutter their checklist with it
    const milestones = gaps
      .filter((g: any) => g.is_fixable)
      .map((g: any) => ({
        title: g.criterion,
        category: g.category || "SKILL",
        description: g.how_to_close || g.criterion,
        is_required: true,
        is_completed: false,
      }));

    // If there's nothing to work toward, the user is already eligible —
    // the path still gets created, just starts at 100%
    const eligibility_score = milestones.length === 0 ? 100 : 0;
    const status = milestones.length === 0 ? "ELIGIBLE" : "IN_PROGRESS";

    const path = await Path.create({
      user: user._id,
      opportunity: opportunity_id,
      milestones,
      eligibility_score,
      status,
      ai_summary: description || null,
    });

    user.paths.push(path._id);
    await user.save();

    return res.status(201).json({
      success: true,
      message: "path created",
      data: path,
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

// GET /paths — the user's dashboard of everything they're tracking
export const get_paths = async (req: Request, res: Response) => {
  const email = req.user!.email;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "user not found" });
    }

    const paths = await Path.find({ user: user._id })
      .populate("opportunity")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "paths fetched",
      data: paths,
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

// PATCH /paths/:pathId/milestones/:milestoneId — check/uncheck a box
export const toggle_milestone = async (req: Request, res: Response) => {
  const email = req.user!.email;
  try {
    const { pathId, milestoneId } = req.params as {
      pathId: string;
      milestoneId: string;
    };

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "user not found" });
    }

    const path = await Path.findOne({ _id: pathId, user: user._id });
    if (!path) {
      return res
        .status(404)
        .json({ success: false, message: "path not found" });
    }

    const milestone = path.milestones.id(milestoneId);
    if (!milestone) {
      return res
        .status(404)
        .json({ success: false, message: "milestone not found" });
    }

    milestone.is_completed = !milestone.is_completed;
    milestone.completed_at = milestone.is_completed ? new Date() : null;

    const required = path.milestones.filter((m: any) => m.is_required);
    const done = required.filter((m: any) => m.is_completed);
    path.eligibility_score = required.length
      ? Math.round((done.length / required.length) * 100)
      : 100;

    path.status = path.eligibility_score === 100 ? "ELIGIBLE" : "IN_PROGRESS";

    await path.save();

    return res.status(200).json({
      success: true,
      message: "milestone updated",
      data: path,
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
