import { Router } from "express";
import { authenticate } from "../middleware/auth_middleware";
import {
  get_notifications,
  mark_as_read,
  mark_all_as_read,
} from "../controllers/notification_controller";

const router = Router();

router.get("/", authenticate, get_notifications);
router.patch("/:id/read", authenticate, mark_as_read);
router.patch("/read-all", authenticate, mark_all_as_read);

export default router;
