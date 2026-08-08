import { Router } from "express";
import * as dashboardController from "../controllers/dashboard.controller";
import { authenticate, authorize } from "../middlewares/auth";

const router = Router();

router.use(authenticate, authorize("student"));

router.get("/summary", dashboardController.summary);
router.get("/timeseries", dashboardController.timeseries);
router.get("/distribution", dashboardController.distribution);

export default router;
