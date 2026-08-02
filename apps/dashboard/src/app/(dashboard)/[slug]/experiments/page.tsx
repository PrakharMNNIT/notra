import type { Metadata } from "next";
import { Suspense } from "react";
import PageClient from "./page-client";
import { ExperimentsPageSkeleton } from "./skeleton";

export const metadata: Metadata = {
  title: "A/B Tests",
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
    <Suspense fallback={<ExperimentsPageSkeleton />}>
      <PageClient organizationSlug={slug} />
    </Suspense>
  );
}
export default Page;
