"use client";

import { Skeleton } from "@notra/ui/components/ui/skeleton";
import { useId } from "react";
import { PageContainer } from "@/components/layout/container";

const CARD_COUNT = 3;

export function ExperimentsPageSkeleton() {
  const id = useId();
  return (
    <PageContainer className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="w-full space-y-6 px-4 lg:px-6">
        <div className="space-y-1">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        {Array.from({ length: CARD_COUNT }).map((_, index) => (
          <Skeleton
            className="h-48 w-full rounded-xl"
            key={`${id}-card-${index}`}
          />
        ))}
      </div>
    </PageContainer>
  );
}
