"use client";

import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@notra/ui/components/ui/button";
import { useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { CreateExperimentDialog } from "@/components/experiments/create-experiment-dialog";
import { ExperimentCard } from "@/components/experiments/experiment-card";
import { PageContainer } from "@/components/layout/container";
import { useOrganizationsContext } from "@/components/providers/organization-provider";
import { useExperiments } from "@/lib/hooks/use-experiments";
import { ExperimentsPageSkeleton } from "./skeleton";

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

  const [createOpen, setCreateOpen] = useState(false);
  const { data, isPending } = useExperiments(organizationId);

  if (isPending) {
    return <ExperimentsPageSkeleton />;
  }

  const experiments = data?.experiments ?? [];
  const running = experiments.filter(
    (experiment) => experiment.status === "running"
  );
  const finished = experiments.filter(
    (experiment) => experiment.status !== "running"
  );

  return (
    <PageContainer className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="w-full space-y-6 px-4 lg:px-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1">
            <h1 className="font-semibold text-2xl">A/B Tests</h1>
            <p className="text-muted-foreground text-sm">
              {running.length} running · compare two posts on one metric
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)} size="sm">
            <HugeiconsIcon icon={Add01Icon} size={16} />
            New test
          </Button>
        </header>

        {experiments.length === 0 ? (
          <EmptyState
            action={
              <Button onClick={() => setCreateOpen(true)}>
                Start your first test
              </Button>
            }
            description="Pick two published posts and a metric. Notra tracks both until you declare a winner — so every posting decision is backed by data."
            title="No experiments yet"
          />
        ) : (
          <>
            {running.length > 0 && (
              <section className="space-y-3">
                {running.map((experiment) => (
                  <ExperimentCard
                    experiment={experiment}
                    key={experiment.id}
                    organizationId={organizationId}
                  />
                ))}
              </section>
            )}
            {finished.length > 0 && (
              <section className="space-y-3">
                <h2 className="font-medium text-muted-foreground text-sm">
                  Finished
                </h2>
                {finished.map((experiment) => (
                  <ExperimentCard
                    experiment={experiment}
                    key={experiment.id}
                    organizationId={organizationId}
                  />
                ))}
              </section>
            )}
          </>
        )}

        <CreateExperimentDialog
          onOpenChange={setCreateOpen}
          open={createOpen}
          organizationId={organizationId}
        />
      </div>
    </PageContainer>
  );
}
