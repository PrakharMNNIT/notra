"use client";

import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { CompetitorManager } from "@/components/geo/competitor-manager";
import { CompetitorShareCard } from "@/components/geo/competitor-share-card";
import { PageContainer } from "@/components/layout/container";
import { useOrganizationsContext } from "@/components/providers/organization-provider";
import { useGeoCompetitorShare, useGeoSettings } from "@/lib/hooks/use-geo";
import { GeoPageSkeleton } from "../skeleton";

interface PageClientProps {
  organizationSlug: string;
}

export default function PageClient({ organizationSlug }: PageClientProps) {
  const { getOrganization, activeOrganization } = useOrganizationsContext();
  const orgFromList = getOrganization(organizationSlug);
  const organization =
    activeOrganization?.slug === organizationSlug
      ? activeOrganization
      : orgFromList;
  const organizationId = organization?.id ?? "";

  const { data: settingsData, isPending } = useGeoSettings(organizationId);
  const { data: competitorShare } = useGeoCompetitorShare(organizationId);

  if (isPending) {
    return <GeoPageSkeleton />;
  }

  const settings = settingsData?.settings ?? null;

  if (!settings) {
    return (
      <PageContainer className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="w-full space-y-6 px-4 lg:px-6">
          <header className="space-y-1">
            <h1 className="font-semibold text-2xl">Competitors</h1>
            <p className="text-muted-foreground text-sm">
              Who AI engines recommend instead of you
            </p>
          </header>
          <EmptyState
            action={
              <Link
                className="text-primary text-sm underline underline-offset-4"
                href={`/${organizationSlug}/geo`}
              >
                Set up GEO tracking
              </Link>
            }
            description="Set up GEO tracking first, then track which competitors AI engines surface."
            title="Not set up yet"
          />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="w-full space-y-6 px-4 lg:px-6">
        <header className="space-y-1">
          <h1 className="font-semibold text-2xl">Competitors</h1>
          <p className="text-muted-foreground text-sm">
            Who AI engines recommend instead of you
          </p>
        </header>
        <CompetitorManager
          organizationId={organizationId}
          settings={settings}
        />
        <CompetitorShareCard
          companyName={settings.companyName}
          points={competitorShare?.points ?? []}
        />
      </div>
    </PageContainer>
  );
}
