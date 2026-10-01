import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api_fetch from "@/lib/api";

export type Gap = {
  criterion: string;
  is_fixable: boolean;
  how_to_close: string | null;
};

export type Match = {
  opportunity_id?: string | null;
  title: string;
  source: "DATABASE" | "LIVE_SEARCH";
  eligibility_status: "ELIGIBLE" | "WORKABLE" | "NOT_ELIGIBLE";
  fit_score: number;
  reasoning: string;
  program_overview: string;
  application_strategy: string;
  gaps: Gap[];
  application_url?: string | null;
  deadline?: string | null;
};

export type OpportunityType =
  | "SCHOLARSHIP"
  | "INTERNSHIP"
  | "JOB"
  | "GRANT"
  | "FELLOWSHIP"
  | "ADMISSION";

export type OpportunityEligibility = {
  min_grade?: number | null;
  status?: Array<"STUDENT" | "GRADUATE" | "NIL">;
  course_keywords?: string[];
  countries?: string[];
  max_age?: number | null;
  requires_leadership?: boolean;
  requires_internship?: boolean;
  min_experience_months?: number | null;
};

export type Opportunity = {
  _id: string;
  title: string;
  type: OpportunityType;
  description: string;
  organization?: string | null;
  country?: string | null;
  eligibility?: OpportunityEligibility | null;
  required_skills?: string[];
  required_certifications?: string[];
  deadline?: string | Date | null;
  application_url?: string | null;
  source_url?: string | null;
  is_active?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export type Milestone = {
  _id: string;
  title: string;
  category:
    | "INTERNSHIP"
    | "LEADERSHIP"
    | "CERTIFICATION"
    | "ACADEMIC"
    | "SKILL"
    | "DOCUMENT";
  description: string;
  is_required: boolean;
  weight: number;
  is_completed: boolean;
  completed_at: string | Date | null;
};

export type TrackedPath = {
  _id: string;
  user?: string;
  opportunity: Opportunity;
  milestones: Milestone[];
  eligibility_score: number;
  status: "IN_PROGRESS" | "ELIGIBLE" | "APPLIED";
  ai_summary?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export type PathsResponse = {
  success: boolean;
  message: string;
  data: TrackedPath[];
};

export type MatchesResponse = {
  success: boolean;
  message: string;
  data: Match[];
};

export const use_recommendations = () => {
  return useQuery<MatchesResponse>({
    queryKey: ["recommendations"],
    queryFn: () => api_fetch("/api/opportunity/recommend"),
    staleTime: 1000 * 60 * 60,
    enabled: false, // never fetch automatically — only via refetch(), on a button click
  });
};

export const use_paths = () => {
  return useQuery<PathsResponse>({
    queryKey: ["paths"],
    queryFn: () => api_fetch("/api/path/get_paths"),
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
    }) =>
      api_fetch("/api/path/create_path", {
        method: "POST",
        body: JSON.stringify(body),
      }),
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
      api_fetch(`/api/path/${pathId}/milestones/${milestoneId}`, {
        method: "PATCH",
        body: JSON.stringify({ details }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paths"] });
    },
  });
};
