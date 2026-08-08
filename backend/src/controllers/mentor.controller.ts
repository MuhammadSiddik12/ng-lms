import type { Request, Response } from "express";
import { z } from "zod";
import * as mentorService from "../services/mentor.service";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { sendSuccess } from "../utils/response";

export const listStudents = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const data = await mentorService.listMentorStudents(req.user.id, req.user.role);
  return sendSuccess(res, data, "Assigned students");
});

export const studentDashboard = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) throw new ApiError(401, "Authentication required");
    const studentId = String(req.params.id);
    const query = z
      .object({ days: z.coerce.number().int().min(1).max(90).default(14) })
      .parse(req.query);
    const data = await mentorService.getMentorStudentDashboard(
      req.user.id,
      req.user.role,
      studentId,
      query.days
    );
    return sendSuccess(res, data, "Student dashboard");
  }
);
