import { number, object, string } from "zod";

export const socialAnalyticsSyncPayloadSchema = object({
  organizationId: string().min(1).optional(),
});

export const analyticsOrganizationInputSchema = object({
  organizationId: string().min(1),
});

export const analyticsTimeseriesInputSchema = object({
  organizationId: string().min(1),
  days: number().int().min(1).max(365).optional(),
});

export const analyticsTopPostsInputSchema = object({
  organizationId: string().min(1),
  limit: number().int().min(1).max(50).optional(),
});
