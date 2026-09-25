import { useMutation, useQueryClient } from "@tanstack/react-query";
import api_fetch from "@/lib/api";

export type Goal =
  | "SCHOLARSHIP"
  | "INTERNSHIP"
  | "JOB"
  | "GRADUATE_SCHOOL"
  | "ADMISSION_ABROAD";
export const use_update_goals = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (goals: Goal[]) =>
      api_fetch("/api/user/update_goals", {
        method: "PATCH",
        body: JSON.stringify({ goals }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current_user"] });
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
    },
  });
};
