import type { Request, Response } from "express";
import * as lessonService from "../services/lesson.service";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { sendSuccess } from "../utils/response";
import { updateProgressSchema } from "../validations/activity.validation";

function requireUser(req: Request) {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }
  return req.user;
}

export const getLesson = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const lessonId = String(req.params.id);
  const data = await lessonService.getLessonDetail(user.id, user.role, lessonId);
  return sendSuccess(res, { lesson: data }, "Lesson detail");
});

export const updateProgress = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const lessonId = String(req.params.id);
  const input = updateProgressSchema.parse(req.body);
  const data = await lessonService.updateLessonProgress(
    user.id,
    user.role,
    lessonId,
    input
  );
  return sendSuccess(res, { progress: data }, "Progress updated");
});
