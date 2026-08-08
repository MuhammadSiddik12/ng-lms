import { z } from "zod";

export const createActivitySchema = z.object({
  eventType: z.enum([
    "lesson_started",
    "lesson_completed",
    "time_logged",
    "quiz_attempt",
  ]),
  lessonId: z.string().uuid().optional().nullable(),
  courseId: z.string().uuid().optional().nullable(),
  durationSeconds: z.coerce.number().int().min(0).max(86_400).default(0),
  metadata: z.record(z.string(), z.unknown()).optional().nullable(),
});

export const updateProgressSchema = z.object({
  status: z.enum(["not_started", "in_progress", "completed"]).optional(),
  timeSpentSeconds: z.coerce.number().int().min(0).max(86_400).optional(),
  incrementSeconds: z.coerce.number().int().min(0).max(86_400).optional(),
});
