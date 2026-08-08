import type { Request, Response } from "express";
import * as dashboardService from "../services/dashboard.service";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { sendSuccess } from "../utils/response";
import {
  distributionQuerySchema,
  timeseriesQuerySchema,
} from "../validations/dashboard.validation";

function requireUser(req: Request) {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }
  return req.user;
}

export const summary = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const data = await dashboardService.getSummary(user.id, user.role);
  return sendSuccess(res, data, "Dashboard summary");
});

export const timeseries = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const query = timeseriesQuerySchema.parse(req.query);
  const data = await dashboardService.getTimeseries(user.id, user.role, query.days);
  return sendSuccess(res, data, "Dashboard timeseries");
});

export const distribution = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const query = distributionQuerySchema.parse(req.query);
  const data = await dashboardService.getDistribution(user.id, user.role, query.by);
  return sendSuccess(res, data, "Dashboard distribution");
});
