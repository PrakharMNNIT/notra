import { EXPERIMENT_WINNER_LIFT_THRESHOLD } from "@/constants/experiments";
import type { ExperimentMetric, ExperimentWinner } from "@/types/experiments";

interface VariantMetricInput {
  impressions: number | null;
  likes: number | null;
  replies: number | null;
  reposts: number | null;
}

export function metricValue(
  metric: ExperimentMetric,
  stats: VariantMetricInput | null
): number | null {
  if (!stats) {
    return null;
  }
  if (metric === "impressions") {
    return stats.impressions;
  }
  if (metric === "likes") {
    return stats.likes;
  }
  return (stats.likes ?? 0) + (stats.replies ?? 0) + (stats.reposts ?? 0);
}

export function computeLiftPercent(
  valueA: number | null,
  valueB: number | null
): number | null {
  if (valueA === null || valueB === null) {
    return null;
  }
  const base = Math.min(valueA, valueB);
  const top = Math.max(valueA, valueB);
  if (base === 0) {
    return top === 0 ? 0 : null;
  }
  return Math.round(((top - base) / base) * 100);
}

export function computeLeader(
  valueA: number | null,
  valueB: number | null
): ExperimentWinner | null {
  if (valueA === null || valueB === null) {
    return null;
  }
  const base = Math.max(Math.min(valueA, valueB), 1);
  const relativeLift = Math.abs(valueA - valueB) / base;
  if (relativeLift < EXPERIMENT_WINNER_LIFT_THRESHOLD) {
    return "tie";
  }
  return valueA > valueB ? "a" : "b";
}
