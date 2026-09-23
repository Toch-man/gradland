import { Request, Response } from "express";
import Notification from "../models/notification_model";

// GET /notifications — latest 50, plus an unread count for the bell badge
export const get_notifications = async (req: Request, res: Response) => {
  const user_id = req.user!.user_id;
  try {
    const notifications = await Notification.find({ user: user_id })
      .sort({ createdAt: -1 })
      .limit(50);

    const unread_count = await Notification.countDocuments({
      user: user_id,
      is_read: false,
    });

    return res.status(200).json({
      success: true,
      data: { notifications, unread_count },
    });
  } catch (error: any) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "internal server error" });
  }
};

// PATCH /notifications/:id/read — mark one as read (e.g. when clicked)
export const mark_as_read = async (req: Request, res: Response) => {
  const user_id = req.user!.user_id;
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: user_id }, // scoped to this user — can't mark someone else's
      { is_read: true },
      { new: true },
    );

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "notification not found" });
    }

    return res.status(200).json({ success: true, data: notification });
  } catch (error: any) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "internal server error" });
  }
};

// PATCH /notifications/read-all — "mark all as read" button
export const mark_all_as_read = async (req: Request, res: Response) => {
  const user_id = req.user!.user_id;
  try {
    await Notification.updateMany(
      { user: user_id, is_read: false },
      { is_read: true },
    );
    return res
      .status(200)
      .json({ success: true, message: "all marked as read" });
  } catch (error: any) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "internal server error" });
  }
};
