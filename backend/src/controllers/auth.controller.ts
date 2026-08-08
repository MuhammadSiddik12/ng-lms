import type { Request, Response } from "express";
import * as authService from "../services/auth.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import { loginSchema, registerSchema } from "../validations/auth.validation";
import { ApiError } from "../utils/ApiError";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const input = registerSchema.parse(req.body);
  const result = await authService.registerUser(input);
  return sendSuccess(res, result, "Registered successfully", 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const input = loginSchema.parse(req.body);
  const result = await authService.loginUser(input);
  return sendSuccess(res, result, "Logged in successfully");
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }
  const user = await authService.getUserById(req.user.id);
  return sendSuccess(res, { user }, "Current user");
});
