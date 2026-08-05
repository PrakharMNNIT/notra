"use client";

import { useState } from "react";
import { ChartSeriesLegend } from "@/components/analytics/chart-legend";
import { EChartsBarChart } from "@/components/evilcharts/charts/echarts-bar-chart";
import type { ChartConfig } from "@/components/evilcharts/ui/echarts-chart";
import {
  InstrumentEmpty,
  InstrumentModule,
} from "@/components/instrument/instrument-module";
import { CHART_MUTED_COLOR, CHART_SECONDARY_COLOR } from "@/constants/charts";
import type { PostingPerformanceCardProps } from "@/types/analytics";
import { seriesColors } from "@/utils/chart-colors";

const chartConfig: ChartConfig = {
  avgEngagement: {
    label: "Avg engagement",
    colors: seriesColors(CHART_SECONDARY_COLOR),
  },
  posts: { label: "Posts", colors: seriesColors(CHART_MUTED_COLOR) },
};

const seriesKeys = Object.keys(chartConfig);

export function PostingPerformanceCard({ rows }: PostingPerformanceCardProps) {
  const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(new Set());
  const visibleKeys = seriesKeys.filter((key) => !hiddenKeys.has(key));
  const hasData = rows.some((row) => row.posts > 0);

  const toggle = (key: string) => {
    setHiddenKeys((previous) => {
      const next = new Set(previous);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <InstrumentModule eyebrow="Best days to post" readout="90D">
      {hasData && visibleKeys.length > 0 ? (
        <EChartsBarChart
          className="h-56 w-full"
          config={chartConfig}
          data={rows}
          xDataKey="day"
        >
          <EChartsBarChart.Grid />
          <EChartsBarChart.XAxis dataKey="day" />
          <EChartsBarChart.YAxis />
          {visibleKeys.map((key) => (
            <EChartsBarChart.Bar dataKey={key} key={key} />
          ))}
          <EChartsBarChart.Tooltip />
        </EChartsBarChart>
      ) : (
        <InstrumentEmpty
          className="h-56"
          message="No posting data yet"
          seed="Best days to post"
        />
      )}
      <ChartSeriesLegend
        config={chartConfig}
        hiddenKeys={hiddenKeys}
        onToggle={toggle}
        orderedKeys={seriesKeys}
      />
    </InstrumentModule>
  );
}
