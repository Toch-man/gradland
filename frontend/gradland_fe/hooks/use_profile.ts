import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import api_fetch from "@/lib/api";

type ProfileUpdateInput = {
  full_name?: string;
  date_of_birth?: string;
  status?: "STUDENT" | "GRADUATE" | "NIL";
  school?: string;
  course_of_study?: string;
  current_grade?: number;
  preferred_countries?: string[];
};

export const use_current_user = () => {
  return useQuery({
    queryKey: ["current_user"],
    queryFn: () => api_fetch("/api/user/user"),
    retry: false,
  });
};

export const use_update_profile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ProfileUpdateInput) =>
      api_fetch("/profile", { method: "PATCH", body: JSON.stringify(body) }),
    onSuccess: (data) => {
      queryClient.setQueryData(["current_user"], data);
    },
  });
};
