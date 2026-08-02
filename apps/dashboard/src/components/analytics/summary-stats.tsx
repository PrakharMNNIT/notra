"use client";

import { Card, CardContent } from "@notra/ui/components/ui/card";
import { useMemo } from "react";
import type {
  EngagementTimeseriesPoint,
  SocialOverviewAccount,
} from "@/types/analytics";
import { formatMetric, sumMetric } from "@/utils/analytics-charts";

interface SummaryStatsProps {
  accounts: SocialOverviewAccount[];
  points: EngagementTimeseriesPoint[];
}

interface StatTile {
  label: string;
  value: string;
  hint: string;
}

const PERCENT = 100;

export function SummaryStats({ accounts, points }: SummaryStatsProps) {
  const tiles = useMemo<StatTile[]>(() => {
    const followers = sumMetric(accounts, (account) => account.followersCount);
    let impressions = 0;
    let interactions = 0;
    let posts = 0;
    for (const point of points) {
      impressions += point.impressions ?? 0;
      interactions +=
        (point.likes ?? 0) + (point.replies ?? 0) + (point.reposts ?? 0);
      posts += point.posts;
    }
    const engagementRate =
      impressions > 0 ? (interactions / impressions) * PERCENT : null;

    return [
      {
        label: "Followers",
        value: formatMetric(followers),
        hint: "across connected accounts",
      },
      {
        label: "Impressions",
        value: formatMetric(impressions),
        hint: "posts from the last 30 days",
      },
      {
        label: "Interactions",
        value: formatMetric(interactions),
        hint: `${posts} posts, last 30 days`,
      },
      {
        label: "Engagement rate",
        value:
          engagementRate === null ? "N/A" : `${engagementRate.toFixed(1)}%`,
        hint: "interactions per impression",
      },
    ];
  }, [accounts, points]);

  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {tiles.map((tile) => (
        <Card className="py-4" key={tile.label}>
          <CardContent className="space-y-0.5 px-4">
            <p className="text-muted-foreground text-xs">{tile.label}</p>
            <p className="font-semibold text-2xl tabular-nums">{tile.value}</p>
            <p className="text-muted-foreground text-xs">{tile.hint}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
