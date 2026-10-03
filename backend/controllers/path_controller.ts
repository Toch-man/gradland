import { Request, Response } from "express";
import Path from "../models/path_model";
import Opportunity from "../models/opportunity_model";
import User from "../models/user_model";
import { jwtPayload } from "../middleware/auth_middleware";

function escapeRegex(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// POST /paths — handles BOTH cases:
// 1. opportunity_id provided → it's a real, already-saved Opportunity (DATABASE match)
// 2. no opportunity_id, but title/description provided → it's a LIVE_SEARCH find
//    the user wants to track RIGHT NOW. We save it as a real Opportunity first,
//    then proceed exactly as case 1 — no more waiting for tomorrow's cron.
export const create_path = async (req: Request, res: Response) => {
  const email = (req.user! as jwtPayload).email;
  try {
    const {
      opportunity_id,
      title,
      description,
      application_url,
      deadline,
      gaps,
    } = req.body;

    if (!Array.isArray(gaps)) {
      return res
        .status(400)
        .json({ success: false, message: "gaps is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "user not found" });
    }

    let final_opportunity_id = opportunity_id;

    if (!final_opportunity_id) {
      if (!title) {
        return res.status(400).json({
          success: false,
          message: "opportunity_id or title is required",
        });
      }

      // Avoid creating a duplicate if this exact title was already saved —
      // by this user's own earlier click, another user's click, or last
      // night's cron run all finding the same thing independently.
      let opportunity = await Opportunity.findOne({
        title: { $regex: `^${escapeRegex(title)}$`, $options: "i" },
      });

      if (!opportunity) {
        opportunity = await Opportunity.create({
          title,
          type: "SCHOLARSHIP", // refine later based on which goal this matched
          description: description || "Found via live search",
          application_url: application_url || null,
          deadline: deadline ? new Date(deadline) : null,
          is_active: true,
        });
      }

      final_opportunity_id = opportunity._id.toString();
    }

    const milestones = gaps
      .filter((g: any) => g.is_fixable)
      .map((g: any) => ({
        title: g.criterion,
        category: g.category || "SKILL",
        description: g.how_to_close || g.criterion,
        is_required: true,
        is_completed: false,
      }));

    const eligibility_score = milestones.length === 0 ? 100 : 0;
    const status = milestones.length === 0 ? "ELIGIBLE" : "IN_PROGRESS";

    const path = await Path.create({
      user: user._id,
      opportunity: final_opportunity_id,
      milestones,
      eligibility_score,
      status,
      ai_summary: description || null,
    });

    user.paths.push(path._id as any);
    await user.save();

    const populated = await path.populate("opportunity");

    return res.status(201).json({
      success: true,
      message: "path created",
      data: populated,
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

export const get_paths = async (req: Request, res: Response) => {
  const email = (req.user! as jwtPayload).email;
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

    return res
      .status(200)
      .json({ success: true, message: "paths fetched", data: paths });
  } catch (error: any) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "internal server error" });
  }
};

// PATCH /paths/:pathId/applied — user clicked "Apply now" and confirms
// they actually submitted the application. Only allowed once a path has
// hit ELIGIBLE, since you can't have applied to something you're not
// even ready for yet.
export const mark_applied = async (req: Request, res: Response) => {
  const email = (req.user! as jwtPayload).email;
  try {
    const { pathId } = req.params;

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

    if (path.status !== "ELIGIBLE") {
      return res.status(400).json({
        success: false,
        message: "This path isn't marked eligible yet",
      });
    }

    path.status = "APPLIED";
    await path.save();
    const populated = await path.populate("opportunity");

    return res
      .status(200)
      .json({ success: true, message: "marked as applied", data: populated });
  } catch (error: any) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "internal server error" });
  }
};

export const toggle_milestone = async (req: Request, res: Response) => {
  const email = (req.user! as jwtPayload).email;
  try {
    const { pathId, milestoneId } = req.params;
    const { details } = req.body;

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

    const milestone = (path.milestones as any).id(milestoneId);
    if (!milestone) {
      return res
        .status(404)
        .json({ success: false, message: "milestone not found" });
    }

    const isCompleting = !milestone.is_completed;
    milestone.is_completed = isCompleting;
    milestone.completed_at = isCompleting ? new Date() : null;

    if (isCompleting && details) {
      if (milestone.category === "INTERNSHIP") {
        user.work_experience.push(details as any);
      } else if (milestone.category === "LEADERSHIP") {
        user.leadership_experience.push(details as any);
      } else if (milestone.category === "CERTIFICATION") {
        user.certifications.push(details.name);
      }
      await user.save();
    }

    const required = path.milestones.filter((m: any) => m.is_required);
    const done = required.filter((m: any) => m.is_completed);
    path.eligibility_score = required.length
      ? Math.round((done.length / required.length) * 100)
      : 100;
    path.status = path.eligibility_score === 100 ? "ELIGIBLE" : "IN_PROGRESS";

    await path.save();
    const populated = await path.populate("opportunity");

    return res
      .status(200)
      .json({ success: true, message: "milestone updated", data: populated });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "internal server error",
      error: error.message,
    });
  }
};
