import { Router } from "express";
import * as recommendationController from "../controllers/recommendation.controller";
import { authenticate, authorize } from "../middlewares/auth";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("student"),
  recommendationController.listRecommendations
);

export default router;
