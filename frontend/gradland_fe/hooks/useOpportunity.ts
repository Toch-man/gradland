import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api_fetch from "@/lib/api";

export const useRecommendation = () => {
  return useQuery({
    queryKey: ["recommendations"],
    queryFn: () => api_fetch("/opportunity/recommend"),
    staleTime: 1000 * 60 * 30, //no refresh until 30min
  });
};

export const usePath = () => {
  return useQuery({
    queryKey: ["paths"],
    queryFn: () => api_fetch("/paths"),
  });
};

export function useCreatePath() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body) =>
      api_fetch("/paths", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paths"] });
    },
  });
}
