import type { Metadata } from "next";
import { Suspense } from "react";
import PageClient from "./page-client";
import { AnalyticsPageSkeleton } from "./skeleton";

export const metadata: Metadata = {
  title: "Analytics",
};

async function Page({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const { slug } = await params;

  return (
    <Suspense fallback={<AnalyticsPageSkeleton />}>
      <PageClient organizationSlug={slug} />
    </Suspense>
  );
}
export default Page;
