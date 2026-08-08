import { Router } from "express";
import * as activityController from "../controllers/activity.controller";
import { authenticate, authorize } from "../middlewares/auth";

const router = Router();

router.post("/", authenticate, authorize("student"), activityController.createActivity);

export default router;
