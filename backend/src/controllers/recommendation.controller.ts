import type { Request, Response } from "express";
import * as recommendationService from "../services/recommendation.service";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { sendSuccess } from "../utils/response";

export const listRecommendations = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) throw new ApiError(401, "Authentication required");
    const data = await recommendationService.getRecommendations(
      req.user.id,
      req.user.role
    );
    return sendSuccess(res, data, "Recommendations");
  }
);
