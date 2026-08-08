import type { Request, Response } from "express";
import * as activityService from "../services/activity.service";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { sendSuccess } from "../utils/response";
import { createActivitySchema } from "../validations/activity.validation";

export const createActivity = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }
  const input = createActivitySchema.parse(req.body);
  const data = await activityService.createActivity(
    req.user.id,
    req.user.role,
    input
  );
  return sendSuccess(res, { activity: data }, "Activity logged", 201);
});
