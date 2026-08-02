"use client";

import { Badge } from "@notra/ui/components/ui/badge";
import { Button } from "@notra/ui/components/ui/button";
import { Card, CardContent, CardHeader } from "@notra/ui/components/ui/card";
import { EXPERIMENT_METRIC_LABELS } from "@/constants/experiments";
import {
  useExperimentCancel,
  useExperimentComplete,
  useExperimentRemove,
} from "@/lib/hooks/use-experiments";
import { cn } from "@/lib/utils";
import type {
  ExperimentItem,
  ExperimentVariantStats,
} from "@/types/experiments";
import { formatMetric } from "@/utils/analytics-charts";

interface ExperimentCardProps {
  experiment: ExperimentItem;
  organizationId: string;
}

const CONTENT_PREVIEW_LENGTH = 80;

function previewContent(content: string | null): string {
  if (!content) {
    return "Post not tracked yet";
  }
  const singleLine = content.replace(/\s+/g, " ").trim();
  if (singleLine.length <= CONTENT_PREVIEW_LENGTH) {
    return singleLine;
  }
  return `${singleLine.slice(0, CONTENT_PREVIEW_LENGTH)}…`;
}

function statusBadge(experiment: ExperimentItem) {
  if (experiment.status === "running") {
    return <Badge variant="secondary">Running</Badge>;
  }
  if (experiment.status === "cancelled") {
    return <Badge variant="outline">Cancelled</Badge>;
  }
  if (experiment.winner === "tie") {
    return <Badge variant="outline">Tie</Badge>;
  }
  return <Badge>Winner: {experiment.winner?.toUpperCase() ?? "?"}</Badge>;
}

function VariantRow({
  label,
  variant,
  otherValue,
  highlighted,
}: {
  label: string;
  variant: ExperimentVariantStats;
  otherValue: number | null;
  highlighted: boolean;
}) {
  const value = variant.value ?? 0;
  const max = Math.max(value, otherValue ?? 0, 1);
  const widthPercent = Math.max(Math.round((value / max) * 100), 4);

  const body = (
    <div
      className={cn(
        "space-y-1.5 rounded-md border p-3",
        highlighted && "border-foreground/25 bg-muted/40"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-muted-foreground text-xs">
          Variant {label}
        </span>
        <span className="font-semibold text-sm tabular-nums">
          {variant.value === null ? "N/A" : formatMetric(variant.value)}
        </span>
      </div>
      <p className="text-sm leading-snug">{previewContent(variant.content)}</p>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full",
            highlighted ? "bg-foreground/80" : "bg-foreground/40"
          )}
          style={{ width: `${widthPercent}%` }}
        />
      </div>
    </div>
  );

  if (variant.url) {
    return (
      <a href={variant.url} rel="noopener noreferrer" target="_blank">
        {body}
      </a>
    );
  }
  return body;
}

export function ExperimentCard({
  experiment,
  organizationId,
}: ExperimentCardProps) {
  const complete = useExperimentComplete(organizationId);
  const cancel = useExperimentCancel(organizationId);
  const remove = useExperimentRemove(organizationId);

  const leader =
    experiment.status === "completed" ? experiment.winner : experiment.leader;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div className="space-y-1">
          <p className="font-semibold">{experiment.name}</p>
          <p className="text-muted-foreground text-xs">
            {EXPERIMENT_METRIC_LABELS[experiment.metric] ?? experiment.metric}
            {experiment.liftPercent !== null &&
              experiment.liftPercent > 0 &&
              ` · ${experiment.liftPercent}% lift`}
            {experiment.hypothesis && ` · ${experiment.hypothesis}`}
          </p>
        </div>
        {statusBadge(experiment)}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2 sm:grid-cols-2">
          <VariantRow
            highlighted={leader === "a"}
            label="A"
            otherValue={experiment.variantB.value}
            variant={experiment.variantA}
          />
          <VariantRow
            highlighted={leader === "b"}
            label="B"
            otherValue={experiment.variantA.value}
            variant={experiment.variantB}
          />
        </div>
        <div className="flex items-center justify-end gap-2">
          {experiment.status === "running" ? (
            <>
              <Button
                disabled={cancel.isPending}
                onClick={() => cancel.mutate(experiment.id)}
                size="sm"
                variant="ghost"
              >
                Cancel
              </Button>
              <Button
                disabled={complete.isPending}
                onClick={() => complete.mutate(experiment.id)}
                size="sm"
                variant="outline"
              >
                Declare winner
              </Button>
            </>
          ) : (
            <Button
              disabled={remove.isPending}
              onClick={() => remove.mutate(experiment.id)}
              size="sm"
              variant="ghost"
            >
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
