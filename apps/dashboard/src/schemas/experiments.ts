import { object, string, enum as zodEnum } from "zod";
import { EXPERIMENT_METRICS } from "@/constants/experiments";

export const experimentMetricSchema = zodEnum(EXPERIMENT_METRICS);

export const experimentsOrganizationInputSchema = object({
  organizationId: string().min(1),
});

export const experimentCreateInputSchema = object({
  organizationId: string().min(1),
  name: string().min(1).max(120),
  hypothesis: string().max(500).optional(),
  provider: string().min(1),
  variantAPostId: string().min(1),
  variantBPostId: string().min(1),
  metric: experimentMetricSchema,
});

export const experimentActionInputSchema = object({
  organizationId: string().min(1),
  experimentId: string().min(1),
});
