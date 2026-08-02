"use client";

import { Card, CardContent } from "@notra/ui/components/ui/card";
import { useMemo } from "react";
import { GEO_ENGINE_LABELS } from "@/constants/geo";
import type { GeoOverviewEngine, GeoSettings } from "@/types/geo";
import { formatMentionRate } from "@/utils/geo-charts";

interface GeoSummaryStatsProps {
  engines: GeoOverviewEngine[];
  settings: GeoSettings;
  promptCount: number;
}

interface StatTile {
  label: string;
  value: string;
  hint: string;
}

const GROUNDED_PATTERN = /-grounded$|^perplexity-sonar$/;

export function GeoSummaryStats({
  engines,
  settings,
  promptCount,
}: GeoSummaryStatsProps) {
  const tiles = useMemo<StatTile[]>(() => {
    const grounded = engines.filter((engine) =>
      GROUNDED_PATTERN.test(engine.engine)
    );
    const pool = grounded.length > 0 ? grounded : engines;
    const checks = pool.reduce((total, engine) => total + engine.checks, 0);
    const mentions = pool.reduce((total, engine) => total + engine.mentions, 0);
    const best = [...engines].sort((a, b) => b.mentionRate - a.mentionRate)[0];

    return [
      {
        label: "AI visibility",
        value: checks > 0 ? formatMentionRate(mentions / checks) : "N/A",
        hint:
          grounded.length > 0
            ? "web-grounded answers mentioning you"
            : "answers mentioning you",
      },
      {
        label: "Best engine",
        value: best ? (GEO_ENGINE_LABELS[best.engine] ?? best.engine) : "N/A",
        hint: best
          ? `${formatMentionRate(best.mentionRate)} mention rate`
          : "run a scan",
      },
      {
        label: "Tracked prompts",
        value: String(promptCount),
        hint: "asked to every engine per scan",
      },
      {
        label: "Competitors watched",
        value: String(settings.competitors.length),
        hint: "named rivals in scans",
      },
    ];
  }, [engines, settings.competitors.length, promptCount]);

  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {tiles.map((tile) => (
        <Card className="py-4" key={tile.label}>
          <CardContent className="space-y-0.5 px-4">
            <p className="text-muted-foreground text-xs">{tile.label}</p>
            <p className="truncate font-semibold text-2xl">{tile.value}</p>
            <p className="text-muted-foreground text-xs">{tile.hint}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
