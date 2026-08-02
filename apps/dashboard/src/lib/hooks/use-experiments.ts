"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  ExperimentMetric,
  ExperimentsResponse,
} from "@/types/experiments";
import { dashboardOrpc } from "../orpc/query";

export function useExperiments(organizationId: string) {
  return useQuery<ExperimentsResponse>({
    ...dashboardOrpc.experiments.list.queryOptions({
      input: { organizationId },
    }),
    enabled: !!organizationId,
    meta: { errorMessage: "Failed to load experiments" },
  });
}

function useInvalidateExperiments(organizationId: string) {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({
      queryKey: dashboardOrpc.experiments.list.queryKey({
        input: { organizationId },
      }),
    });
}

export function useExperimentCreate(organizationId: string) {
  const invalidate = useInvalidateExperiments(organizationId);
  return useMutation({
    mutationFn: (input: {
      name: string;
      hypothesis?: string;
      provider: string;
      variantAPostId: string;
      variantBPostId: string;
      metric: ExperimentMetric;
    }) => dashboardOrpc.experiments.create.call({ organizationId, ...input }),
    onSuccess: async () => {
      toast.success("Experiment started");
      await invalidate();
    },
    onError: () => toast.error("Failed to create experiment"),
  });
}

export function useExperimentComplete(organizationId: string) {
  const invalidate = useInvalidateExperiments(organizationId);
  return useMutation({
    mutationFn: (experimentId: string) =>
      dashboardOrpc.experiments.complete.call({ organizationId, experimentId }),
    onSuccess: async (result) => {
      toast.success(
        result.winner === "tie"
          ? "Completed: too close to call"
          : `Completed: variant ${result.winner?.toUpperCase() ?? "?"} wins`
      );
      await invalidate();
    },
    onError: () => toast.error("Failed to complete experiment"),
  });
}

export function useExperimentCancel(organizationId: string) {
  const invalidate = useInvalidateExperiments(organizationId);
  return useMutation({
    mutationFn: (experimentId: string) =>
      dashboardOrpc.experiments.cancel.call({ organizationId, experimentId }),
    onSuccess: async () => {
      await invalidate();
    },
    onError: () => toast.error("Failed to cancel experiment"),
  });
}

export function useExperimentRemove(organizationId: string) {
  const invalidate = useInvalidateExperiments(organizationId);
  return useMutation({
    mutationFn: (experimentId: string) =>
      dashboardOrpc.experiments.remove.call({ organizationId, experimentId }),
    onSuccess: async () => {
      await invalidate();
    },
    onError: () => toast.error("Failed to delete experiment"),
  });
}
