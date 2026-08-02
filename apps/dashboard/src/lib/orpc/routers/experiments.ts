import {
  isTinybirdConfigured,
  queryPostMetricsLookup,
} from "@notra/analytics/tinybird/client";
import { db } from "@notra/db/drizzle";
import { socialExperiments } from "@notra/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { assertOrganizationAccess } from "@/lib/auth/organization";
import { authorizedProcedure } from "@/lib/orpc/base";
import {
  experimentActionInputSchema,
  experimentCreateInputSchema,
  experimentMetricSchema,
  experimentsOrganizationInputSchema,
} from "@/schemas/experiments";
import type {
  ExperimentItem,
  ExperimentStatus,
  ExperimentsResponse,
  ExperimentVariantStats,
  ExperimentWinner,
} from "@/types/experiments";
import {
  computeLeader,
  computeLiftPercent,
  metricValue,
} from "@/utils/experiments";
import { notFound } from "../utils/errors";

interface PostLookupEntry {
  content: string;
  url: string | null;
  impressions: number | null;
  likes: number | null;
  replies: number | null;
  reposts: number | null;
}

function parseStatus(value: string): ExperimentStatus {
  if (value === "completed" || value === "cancelled") {
    return value;
  }
  return "running";
}

function parseWinner(value: string | null): ExperimentWinner | null {
  if (value === "a" || value === "b" || value === "tie") {
    return value;
  }
  return null;
}

function toNullableNumber(value: number | bigint | null): number | null {
  if (value === null) {
    return null;
  }
  return Number(value);
}

function buildVariant(
  postId: string,
  metric: "engagement" | "impressions" | "likes",
  lookup: Map<string, PostLookupEntry>
): ExperimentVariantStats {
  const entry = lookup.get(postId) ?? null;
  return {
    postId,
    content: entry?.content ?? null,
    url: entry?.url ?? null,
    value: metricValue(metric, entry),
    impressions: entry?.impressions ?? null,
    likes: entry?.likes ?? null,
    replies: entry?.replies ?? null,
    reposts: entry?.reposts ?? null,
  };
}

async function loadPostLookup(
  organizationId: string,
  postIds: string[]
): Promise<Map<string, PostLookupEntry>> {
  if (postIds.length === 0 || !isTinybirdConfigured()) {
    return new Map();
  }
  const result = await queryPostMetricsLookup({
    organization_id: organizationId,
    post_ids: postIds,
  }).catch((error) => {
    console.error("[Experiments] post lookup failed:", error);
    return null;
  });
  return new Map(
    (result?.data ?? []).map((row) => [
      row.platform_post_id,
      {
        content: row.content,
        url: row.url,
        impressions: toNullableNumber(row.impressions),
        likes: toNullableNumber(row.likes),
        replies: toNullableNumber(row.replies),
        reposts: toNullableNumber(row.reposts),
      },
    ])
  );
}

async function findExperiment(organizationId: string, experimentId: string) {
  const experiment = await db.query.socialExperiments.findFirst({
    where: and(
      eq(socialExperiments.id, experimentId),
      eq(socialExperiments.organizationId, organizationId)
    ),
  });
  if (!experiment) {
    throw notFound("Experiment not found");
  }
  return experiment;
}

export const experimentsRouter = {
  list: authorizedProcedure
    .input(experimentsOrganizationInputSchema)
    .handler(async ({ context, input }): Promise<ExperimentsResponse> => {
      await assertOrganizationAccess({
        headers: context.headers,
        organizationId: input.organizationId,
        user: context.user,
      });

      const rows = await db.query.socialExperiments.findMany({
        where: eq(socialExperiments.organizationId, input.organizationId),
        orderBy: [desc(socialExperiments.createdAt)],
      });

      const postIds = [
        ...new Set(
          rows.flatMap((row) => [row.variantAPostId, row.variantBPostId])
        ),
      ];
      const lookup = await loadPostLookup(input.organizationId, postIds);

      const experiments: ExperimentItem[] = rows.map((row) => {
        const metric = experimentMetricSchema
          .catch("engagement")
          .parse(row.metric);
        const variantA = buildVariant(row.variantAPostId, metric, lookup);
        const variantB = buildVariant(row.variantBPostId, metric, lookup);
        return {
          id: row.id,
          name: row.name,
          hypothesis: row.hypothesis,
          provider: row.provider,
          metric,
          status: parseStatus(row.status),
          winner: parseWinner(row.winner),
          startedAt: row.startedAt.toISOString(),
          endedAt: row.endedAt?.toISOString() ?? null,
          variantA,
          variantB,
          liftPercent: computeLiftPercent(variantA.value, variantB.value),
          leader: computeLeader(variantA.value, variantB.value),
        };
      });

      return { configured: isTinybirdConfigured(), experiments };
    }),
  create: authorizedProcedure
    .input(experimentCreateInputSchema)
    .handler(async ({ context, input }) => {
      await assertOrganizationAccess({
        headers: context.headers,
        organizationId: input.organizationId,
        user: context.user,
      });

      const [created] = await db
        .insert(socialExperiments)
        .values({
          id: crypto.randomUUID(),
          organizationId: input.organizationId,
          name: input.name,
          hypothesis: input.hypothesis ?? null,
          provider: input.provider,
          variantAPostId: input.variantAPostId,
          variantBPostId: input.variantBPostId,
          metric: input.metric,
        })
        .returning({ id: socialExperiments.id });

      return { id: created?.id ?? null };
    }),
  complete: authorizedProcedure
    .input(experimentActionInputSchema)
    .handler(async ({ context, input }) => {
      await assertOrganizationAccess({
        headers: context.headers,
        organizationId: input.organizationId,
        user: context.user,
      });

      const experiment = await findExperiment(
        input.organizationId,
        input.experimentId
      );
      const metric = experimentMetricSchema
        .catch("engagement")
        .parse(experiment.metric);
      const lookup = await loadPostLookup(input.organizationId, [
        experiment.variantAPostId,
        experiment.variantBPostId,
      ]);
      const valueA = metricValue(
        metric,
        lookup.get(experiment.variantAPostId) ?? null
      );
      const valueB = metricValue(
        metric,
        lookup.get(experiment.variantBPostId) ?? null
      );
      const winner = computeLeader(valueA, valueB);

      await db
        .update(socialExperiments)
        .set({
          status: "completed",
          winner,
          endedAt: new Date(),
        })
        .where(eq(socialExperiments.id, experiment.id));

      return { winner };
    }),
  cancel: authorizedProcedure
    .input(experimentActionInputSchema)
    .handler(async ({ context, input }) => {
      await assertOrganizationAccess({
        headers: context.headers,
        organizationId: input.organizationId,
        user: context.user,
      });

      const experiment = await findExperiment(
        input.organizationId,
        input.experimentId
      );
      await db
        .update(socialExperiments)
        .set({ status: "cancelled", endedAt: new Date() })
        .where(eq(socialExperiments.id, experiment.id));

      return { success: true };
    }),
  remove: authorizedProcedure
    .input(experimentActionInputSchema)
    .handler(async ({ context, input }) => {
      await assertOrganizationAccess({
        headers: context.headers,
        organizationId: input.organizationId,
        user: context.user,
      });

      const experiment = await findExperiment(
        input.organizationId,
        input.experimentId
      );
      await db
        .delete(socialExperiments)
        .where(eq(socialExperiments.id, experiment.id));

      return { success: true };
    }),
};
