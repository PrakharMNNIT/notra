"use client";

import { Skeleton } from "@notra/ui/components/ui/skeleton";
import { useId } from "react";
import { PageContainer } from "@/components/layout/container";

const ACCOUNT_CARD_COUNT = 2;
const CHART_CARD_COUNT = 2;

export function AnalyticsPageSkeleton() {
  const id = useId();
  return (
    <PageContainer className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="w-full space-y-6 px-4 lg:px-6">
        <div className="space-y-1">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: ACCOUNT_CARD_COUNT }).map((_, index) => (
            <Skeleton
              className="h-32 w-full rounded-xl"
              key={`${id}-account-${index}`}
            />
          ))}
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          {Array.from({ length: CHART_CARD_COUNT }).map((_, index) => (
            <Skeleton
              className="h-80 w-full rounded-xl"
              key={`${id}-chart-${index}`}
            />
          ))}
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    </PageContainer>
  );
}
