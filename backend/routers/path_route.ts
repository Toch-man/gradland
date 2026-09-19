import express from "express";
import * as path_controller from "../controllers/path_controller";
import { authenticate } from "../middleware/auth_middleware";

const router = express.Router();

router.post("/create_path", authenticate, path_controller.create_path);
router.get("/get_paths", authenticate, path_controller.get_paths);
router.patch(
  "toggle_milestone",
  authenticate,
  path_controller.toggle_milestone,
);

export default router;
