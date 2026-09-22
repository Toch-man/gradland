import api_fetch from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type SignUpInput = {
  full_name: string;
  email: string;
  password: string;
  age: number;
  status: "STUDENT" | "GRADUATE" | "NIL";
  school?: string;
  course_of_study?: string;
  current_grade?: number;
};

type LogInInput = {
  email: string;
  password: string;
};

export const use_current_user = () => {
  return useQuery({
    queryKey: ["current_user"],
    queryFn: () => api_fetch("/profile"),
    retry: false,
  });
};

export const use_sign_up = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: SignUpInput) =>
      api_fetch("/sign_up", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: (data) => {
      queryClient.setQueryData(["current_user"], data);
    },
  });
};

export const use_log_in = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: LogInInput) =>
      api_fetch("/log_in", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: (data) => {
      queryClient.setQueryData(["current_user"], data);
    },
  });
};

export const use_log_out = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api_fetch("/log_out", { method: "POST" }),
  });
};
