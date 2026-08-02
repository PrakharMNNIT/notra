export type ExperimentMetric = "engagement" | "impressions" | "likes";

export type ExperimentStatus = "running" | "completed" | "cancelled";

export type ExperimentWinner = "a" | "b" | "tie";

export interface ExperimentVariantStats {
  postId: string;
  content: string | null;
  url: string | null;
  value: number | null;
  impressions: number | null;
  likes: number | null;
  replies: number | null;
  reposts: number | null;
}

export interface ExperimentItem {
  id: string;
  name: string;
  hypothesis: string | null;
  provider: string;
  metric: ExperimentMetric;
  status: ExperimentStatus;
  winner: ExperimentWinner | null;
  startedAt: string;
  endedAt: string | null;
  variantA: ExperimentVariantStats;
  variantB: ExperimentVariantStats;
  liftPercent: number | null;
  leader: ExperimentWinner | null;
}

export interface ExperimentsResponse {
  configured: boolean;
  experiments: ExperimentItem[];
}
