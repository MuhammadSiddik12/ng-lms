import { Router } from "express";
import * as lessonController from "../controllers/lesson.controller";
import { authenticate } from "../middlewares/auth";

const router = Router();

router.use(authenticate);

router.get("/:id", lessonController.getLesson);
router.patch("/:id/progress", lessonController.updateProgress);

export default router;
