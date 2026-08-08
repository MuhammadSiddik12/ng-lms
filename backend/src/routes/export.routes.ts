import { Router } from "express";
import * as exportController from "../controllers/export.controller";
import { authenticate, authorize } from "../middlewares/auth";

const router = Router();

router.get(
  "/progress.csv",
  authenticate,
  authorize("student"),
  exportController.exportProgressCsv
);

export default router;
