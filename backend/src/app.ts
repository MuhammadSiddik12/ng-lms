import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { setupSwagger } from "./docs/swagger";
import { errorHandler } from "./middlewares/errorHandler";
import activityRoutes from "./routes/activity.routes";
import authRoutes from "./routes/auth.routes";
import courseRoutes from "./routes/course.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import exportRoutes from "./routes/export.routes";
import healthRoutes from "./routes/health.routes";
import lessonRoutes from "./routes/lesson.routes";
import mentorRoutes from "./routes/mentor.routes";
import recommendationRoutes from "./routes/recommendation.routes";

export function createApp() {
  const app = express();

  // Relax CSP enough for Swagger UI assets/inline styles
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "validator.swagger.io"],
        },
      },
    })
  );
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

  setupSwagger(app);

  app.use("/api/health", healthRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/courses", courseRoutes);
  app.use("/api/lessons", lessonRoutes);
  app.use("/api/activities", activityRoutes);
  app.use("/api/recommendations", recommendationRoutes);
  app.use("/api/export", exportRoutes);
  app.use("/api/mentor", mentorRoutes);

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
