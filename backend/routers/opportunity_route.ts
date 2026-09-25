import express from "express";
import * as opportunity_controller from "../controllers/opportunity_controller";
import { authenticate } from "../middleware/auth_middleware";
import { ai_limiter } from "../middleware/rate_limit";
const router = express.Router();

router.get(
  "/recommend",

  authenticate,
  ai_limiter,
  opportunity_controller.recommend_opportunity,
);

export default router;
