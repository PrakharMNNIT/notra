export const EXPERIMENT_METRICS = [
  "engagement",
  "impressions",
  "likes",
] as const;

export const EXPERIMENT_METRIC_LABELS: Record<string, string> = {
  engagement: "Engagement",
  impressions: "Impressions",
  likes: "Likes",
};

export const EXPERIMENT_WINNER_LIFT_THRESHOLD = 0.05;
export const EXPERIMENT_POST_PICKER_LIMIT = 30;
