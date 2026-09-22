import * as auth_controller from "../controllers/auth_controller";
import express from "express";
import { auth_limiter } from "../middleware/rate_limit";
const router = express.Router();

router.post("/sign_up", auth_limiter, auth_controller.signup);
router.post("/log_in", auth_limiter, auth_controller.login);
router.post("/refresh_token", auth_limiter, auth_controller.refresh_token);
router.post("/logout", auth_limiter, auth_controller.log_out);

export default router;
