import express from "express";
import * as path_controller from "../controllers/path_controller";
import { authenticate } from "../middleware/auth_middleware";
import { general_limiter } from "../middleware/rate_limit";
const router = express.Router();

router.post(
  "/create_path",
  general_limiter,
  authenticate,
  path_controller.create_path,
);
router.get(
  "/get_paths",
  general_limiter,
  authenticate,
  path_controller.get_paths,
);
router.patch(
  "/toggle_milestone",

  authenticate,
  general_limiter,
  path_controller.toggle_milestone,
);

export default router;
