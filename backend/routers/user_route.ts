import * as user_controller from "../controllers/user_controller";
import { authenticate } from "../middleware/auth_middleware";
import { general_limiter } from "../middleware/rate_limit";
import express from "express";

const router = express.Router();

router.get("/user", authenticate, general_limiter, user_controller.get_profile);
router.patch(
  "/update_profile",
  authenticate,
  general_limiter,
  user_controller.update_profile,
);
router.patch(
  "/update_goals",
  authenticate,
  general_limiter,
  user_controller.update_goals,
);

export default router;
