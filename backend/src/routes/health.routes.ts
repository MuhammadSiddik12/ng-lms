import { Router } from "express";
import { sendSuccess } from "../utils/response";

const router = Router();

router.get("/", (_req, res) => {
  sendSuccess(res, {
    status: "ok",
    service: "progresspulse-api",
    timestamp: new Date().toISOString(),
  });
});

export default router;
