import type { Request, Response } from "express";
import * as exportService from "../services/export.service";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

export const exportProgressCsv = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) throw new ApiError(401, "Authentication required");
    const csv = await exportService.buildProgressCsv(req.user.id, req.user.role);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="nglms-progress.csv"'
    );
    return res.status(200).send(csv);
  }
);
