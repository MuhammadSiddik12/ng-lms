import { Router } from "express";
import * as mentorController from "../controllers/mentor.controller";
import { authenticate, authorize } from "../middlewares/auth";

const router = Router();

router.use(authenticate, authorize("mentor"));

router.get("/students", mentorController.listStudents);
router.get("/students/:id/dashboard", mentorController.studentDashboard);

export default router;
