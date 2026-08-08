import { z } from "zod";

export const timeseriesQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(90).default(14),
});

export const distributionQuerySchema = z.object({
  by: z.enum(["status", "category"]).default("status"),
});
