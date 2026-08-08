import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { errorHandler } from "./middlewares/errorHandler";
import healthRoutes from "./routes/health.routes";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 300,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  app.use("/api/health", healthRoutes);

  // Feature routes will be mounted in later milestones:
  // /api/auth, /api/dashboard, /api/courses, /api/lessons, /api/activities, etc.

  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      message: "Route not found",
      errors: [],
    });
  });

  app.use(errorHandler);
  return app;
}
