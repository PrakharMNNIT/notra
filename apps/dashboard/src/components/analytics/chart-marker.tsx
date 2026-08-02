"use client";

import { useChartPart } from "@notra/ui/components/dither-kit/chart-context";

interface VerticalMarkerProps {
  index: number | null;
  label: string;
}

export function VerticalMarker({ index, label }: VerticalMarkerProps) {
  const ctx = useChartPart("VerticalMarker");
  if (!ctx.ready || index === null || index < 0 || index >= ctx.dataLength) {
    return null;
  }

  const x = ctx.xCenter(index);
  return (
    <g>
      <line
        className="stroke-muted-foreground/70"
        strokeDasharray="3 3"
        x1={x}
        x2={x}
        y1={0}
        y2={ctx.plot.height}
      />
      <text
        className="fill-muted-foreground font-mono text-[0.625rem]"
        textAnchor="start"
        x={x + 4}
        y={10}
      >
        {label}
      </text>
    </g>
  );
}
