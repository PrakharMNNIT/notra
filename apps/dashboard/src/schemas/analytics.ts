import { literal, number, object, string, union } from "zod";

const LEADERBOARD_USERNAME_MAX_LENGTH = 30;
const LEADING_AT_REGEX = /^@/;

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

export const leaderboardInputSchema = object({
  organizationId: string().min(1),
  days: union([literal(7), literal(30)]).default(7),
});

export const trackAccountInputSchema = object({
  organizationId: string().min(1),
  username: string()
    .min(1)
    .max(LEADERBOARD_USERNAME_MAX_LENGTH)
    .transform((value) => value.trim().replace(LEADING_AT_REGEX, "")),
});

export const untrackAccountInputSchema = object({
  organizationId: string().min(1),
  trackedAccountId: string().min(1),
});
