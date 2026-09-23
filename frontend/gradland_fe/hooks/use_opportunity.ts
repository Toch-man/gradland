import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api_fetch from "@/lib/api";

export type Gap = {
  criterion: string;
  is_fixable: boolean;
  how_to_close: string | null;
};

export type Match = {
  opportunity_id: string | null;
  title: string;
  source: "DATABASE" | "LIVE_SEARCH";
  eligibility_status: "ELIGIBLE" | "WORKABLE" | "NOT_ELIGIBLE";
  fit_score: number;
  reasoning: string;
  gaps: Gap[];
  application_url: string | null;
  deadline: string | null;
};

export type Milestone = {
  _id: string;
  title: string;
  category: string;
  description: string;
  is_completed: boolean;
};

export type TrackedPath = {
  _id: string;
  opportunity: { _id: string; title: string; application_url?: string };
  milestones: Milestone[];
  eligibility_score: number;
  status: "IN_PROGRESS" | "ELIGIBLE" | "APPLIED";
};

export const use_recommendations = () => {
  return useQuery<Match[]>({
    queryKey: ["recommendations"],
    queryFn: () => api_fetch("/opportunities/recommend"),
    staleTime: 1000 * 60 * 30, // expensive AI call — don't refetch for 30 min
  });
};

export const use_paths = () => {
  return useQuery<TrackedPath[]>({
    queryKey: ["paths"],
    queryFn: () => api_fetch("/paths"),
  });
};

export const use_create_path = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      opportunity_id: string;
      title: string;
      description: string;
      gaps: Gap[];
    }) => api_fetch("/paths", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paths"] });
    },
  });
};

export const use_toggle_milestone = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      pathId,
      milestoneId,
      details,
    }: {
      pathId: string;
      milestoneId: string;
      details?: Record<string, any>;
    }) =>
      api_fetch(`/paths/${pathId}/milestones/${milestoneId}`, {
        method: "PATCH",
        body: JSON.stringify({ details }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paths"] });
    },
  });
};
