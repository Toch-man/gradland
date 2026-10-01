import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api_fetch from "@/lib/api";

export type NotificationItem = {
  _id: string;
  message: string;
  link: string | null;
  is_read: boolean;
  createdAt: string;
};

type NotificationsResponse = {
  notifications: NotificationItem[];
  unread_count: number;
};

export const use_notifications = () => {
  return useQuery<NotificationsResponse>({
    queryKey: ["notifications"],
    queryFn: () => api_fetch("/api/notifications"),
    refetchInterval: 60 * 1000,
  });
};

export const use_mark_as_read = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api_fetch(`/api/notifications/${id}/read`, { method: "PATCH" }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
};

export const use_mark_all_as_read = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api_fetch("/api/notifications/read-all", { method: "PATCH" }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
};
