import * as user_controller from "../controllers/user_controller";
import { authenticate } from "../middleware/auth_middleware";
import express from "express";

const router = express.Router();

router.get("/user", authenticate, user_controller.get_profile);
router.patch("/update_profile", authenticate, user_controller.update_profile);
router.patch("/update_goals", authenticate, user_controller.update_goals);

export default router;
