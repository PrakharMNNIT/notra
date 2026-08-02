"use client";

import { useQuery } from "@tanstack/react-query";
import type {
  EngagementTimeseriesResponse,
  FollowerGrowthResponse,
  NotraAdoptionResponse,
  PostingPerformanceResponse,
  SocialOverviewResponse,
  TopPostsResponse,
} from "@/types/analytics";
import { dashboardOrpc } from "../orpc/query";

const DEFAULT_TIMESERIES_DAYS = 30;
const DEFAULT_TOP_POSTS_LIMIT = 8;

export function useSocialOverview(organizationId: string) {
  return useQuery<SocialOverviewResponse>({
    ...dashboardOrpc.analytics.overview.queryOptions({
      input: { organizationId },
    }),
    enabled: !!organizationId,
    meta: { errorMessage: "Failed to load analytics overview" },
  });
}

export function useEngagementTimeseries(organizationId: string, days?: number) {
  return useQuery<EngagementTimeseriesResponse>({
    ...dashboardOrpc.analytics.engagementTimeseries.queryOptions({
      input: { organizationId, days: days ?? DEFAULT_TIMESERIES_DAYS },
    }),
    enabled: !!organizationId,
    meta: { errorMessage: "Failed to load engagement data" },
  });
}

export function useTopPosts(organizationId: string, limit?: number) {
  return useQuery<TopPostsResponse>({
    ...dashboardOrpc.analytics.topPosts.queryOptions({
      input: { organizationId, limit: limit ?? DEFAULT_TOP_POSTS_LIMIT },
    }),
    enabled: !!organizationId,
    meta: { errorMessage: "Failed to load top posts" },
  });
}

export function useFollowerGrowth(organizationId: string, days?: number) {
  return useQuery<FollowerGrowthResponse>({
    ...dashboardOrpc.analytics.followerGrowth.queryOptions({
      input: { organizationId, days: days ?? DEFAULT_TIMESERIES_DAYS },
    }),
    enabled: !!organizationId,
    meta: { errorMessage: "Failed to load follower growth" },
  });
}

const DEFAULT_PERFORMANCE_DAYS = 90;

export function usePostingPerformance(organizationId: string, days?: number) {
  return useQuery<PostingPerformanceResponse>({
    ...dashboardOrpc.analytics.postingPerformance.queryOptions({
      input: { organizationId, days: days ?? DEFAULT_PERFORMANCE_DAYS },
    }),
    enabled: !!organizationId,
    meta: { errorMessage: "Failed to load posting performance" },
  });
}

export function useNotraAdoption(organizationId: string) {
  return useQuery<NotraAdoptionResponse>({
    ...dashboardOrpc.analytics.adoption.queryOptions({
      input: { organizationId },
    }),
    enabled: !!organizationId,
    meta: { errorMessage: "Failed to load adoption data" },
  });
}
