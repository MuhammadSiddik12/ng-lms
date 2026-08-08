import type { Request, Response } from "express";
import * as courseService from "../services/course.service";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { sendSuccess } from "../utils/response";

function requireUser(req: Request) {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }
  return req.user;
}

export const listCourses = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const data = await courseService.listCoursesForUser(user.id, user.role);
  return sendSuccess(res, { courses: data }, "Courses");
});

export const getCourse = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const courseId = String(req.params.id);
  const data = await courseService.getCourseDetail(user.id, user.role, courseId);
  return sendSuccess(res, { course: data }, "Course detail");
});
