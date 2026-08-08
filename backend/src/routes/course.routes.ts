import { Router } from "express";
import * as courseController from "../controllers/course.controller";
import { authenticate } from "../middlewares/auth";

const router = Router();

router.use(authenticate);

router.get("/", courseController.listCourses);
router.get("/:id", courseController.getCourse);

export default router;
