import { withAlpha } from "@/components/evilcharts/ui/echarts-chart";
import type { ChartMarker } from "@/types/charts";

// Vertical annotation lines ("Joined Notra", …) attached to the first built
// series. ECharts scopes markLine to a series, so the option is patched after
// the build rather than passed through chartOptions (which replaces series).

const MARKER_LINE_OPACITY = 0.7;
const MARKER_LABEL_FONT_SIZE = 10;
const MARKER_LABEL_DISTANCE = 4;

function buildMarkLine(markers: readonly ChartMarker[], color: string) {
  return {
    silent: true,
    symbol: "none",
    animation: false,
    lineStyle: {
      color: withAlpha(color, MARKER_LINE_OPACITY),
      width: 1,
      type: "dashed",
    },
    label: {
      show: true,
      position: "insideEndTop",
      distance: MARKER_LABEL_DISTANCE,
      color,
      fontSize: MARKER_LABEL_FONT_SIZE,
      fontFamily: "monospace",
      formatter: ({ name }: { name: string }) => name,
    },
    data: markers.map((marker) => ({
      xAxis: marker.value,
      name: marker.label,
    })),
  };
}

export function applyChartMarkers(
  option: { series?: unknown },
  markers: readonly ChartMarker[] | undefined,
  color: string
): void {
  if (!markers || markers.length === 0) {
    return;
  }
  const series = option.series;
  if (!Array.isArray(series)) {
    return;
  }
  const first: unknown = series[0];
  if (typeof first !== "object" || first === null) {
    return;
  }
  Object.assign(first, { markLine: buildMarkLine(markers, color) });
}
