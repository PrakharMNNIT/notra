"use client";

import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@notra/ui/components/shared/responsive-dialog";
import { Button } from "@notra/ui/components/ui/button";
import { Input } from "@notra/ui/components/ui/input";
import { Label } from "@notra/ui/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@notra/ui/components/ui/select";
import { Loader2Icon } from "lucide-react";
import { useId, useState } from "react";
import {
  EXPERIMENT_METRIC_LABELS,
  EXPERIMENT_METRICS,
  EXPERIMENT_POST_PICKER_LIMIT,
} from "@/constants/experiments";
import { useExperimentCreate } from "@/lib/hooks/use-experiments";
import { useTopPosts } from "@/lib/hooks/use-social-analytics";
import type { ExperimentMetric } from "@/types/experiments";

interface CreateExperimentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
}

const POST_LABEL_LENGTH = 60;

function postLabel(content: string): string {
  const singleLine = content.replace(/\s+/g, " ").trim();
  if (singleLine.length <= POST_LABEL_LENGTH) {
    return singleLine;
  }
  return `${singleLine.slice(0, POST_LABEL_LENGTH)}…`;
}

export function CreateExperimentDialog({
  open,
  onOpenChange,
  organizationId,
}: CreateExperimentDialogProps) {
  const id = useId();
  const [name, setName] = useState("");
  const [metric, setMetric] = useState<ExperimentMetric>("engagement");
  const [variantAPostId, setVariantAPostId] = useState("");
  const [variantBPostId, setVariantBPostId] = useState("");
  const create = useExperimentCreate(organizationId);
  const { data: topPosts } = useTopPosts(
    organizationId,
    EXPERIMENT_POST_PICKER_LIMIT
  );

  const posts = topPosts?.posts ?? [];
  const variantAPost = posts.find(
    (post) => post.platformPostId === variantAPostId
  );

  const canCreate =
    name.trim().length > 0 &&
    variantAPostId.length > 0 &&
    variantBPostId.length > 0 &&
    variantAPostId !== variantBPostId;

  const handleCreate = () => {
    if (!canCreate) {
      return;
    }
    create.mutate(
      {
        name: name.trim(),
        provider: variantAPost?.provider ?? "twitter",
        variantAPostId,
        variantBPostId,
        metric,
      },
      {
        onSuccess: () => {
          setName("");
          setVariantAPostId("");
          setVariantBPostId("");
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <ResponsiveDialog onOpenChange={onOpenChange} open={open}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>New A/B test</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Compare two published posts on one metric. Metrics update on every
            sync until you declare a winner.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <div className="space-y-4 px-4 md:px-0">
          <div className="space-y-2">
            <Label htmlFor={`${id}-name`}>Name</Label>
            <Input
              id={`${id}-name`}
              onChange={(event) => setName(event.target.value)}
              placeholder="Hook style: question vs statement"
              value={name}
            />
          </div>
          <div className="space-y-2">
            <Label>Metric</Label>
            <Select
              onValueChange={(value) => {
                const parsed = EXPERIMENT_METRICS.find(
                  (candidate) => candidate === value
                );
                if (parsed) {
                  setMetric(parsed);
                }
              }}
              value={metric}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPERIMENT_METRICS.map((candidate) => (
                  <SelectItem key={candidate} value={candidate}>
                    {EXPERIMENT_METRIC_LABELS[candidate]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Variant A</Label>
            <Select
              onValueChange={(value) => setVariantAPostId(value ?? "")}
              value={variantAPostId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pick a post" />
              </SelectTrigger>
              <SelectContent>
                {posts.map((post) => (
                  <SelectItem
                    disabled={post.platformPostId === variantBPostId}
                    key={post.platformPostId}
                    value={post.platformPostId}
                  >
                    {postLabel(post.content)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Variant B</Label>
            <Select
              onValueChange={(value) => setVariantBPostId(value ?? "")}
              value={variantBPostId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pick a post" />
              </SelectTrigger>
              <SelectContent>
                {posts.map((post) => (
                  <SelectItem
                    disabled={post.platformPostId === variantAPostId}
                    key={post.platformPostId}
                    value={post.platformPostId}
                  >
                    {postLabel(post.content)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <ResponsiveDialogFooter>
          <Button
            disabled={!canCreate || create.isPending}
            onClick={handleCreate}
          >
            {create.isPending && (
              <Loader2Icon className="size-4 animate-spin" />
            )}
            Start test
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
