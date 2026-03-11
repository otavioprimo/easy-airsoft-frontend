import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type {
  ListNotificationsResponse,
  UnreadNotificationsCountResponse,
} from "@/types/notifications";

type ApiSuccessResponse<T> = {
  success: boolean;
  data: T;
};

export function useNotificationsQuery(page: number = 1) {
  const { user, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["notifications", user?.id, page],
    queryFn: async () => {
      const response = await api.get<ApiSuccessResponse<ListNotificationsResponse>>(
        "/notifications",
        { params: { page, limit: 20 } },
      );
      return response.data.data;
    },
    enabled: isAuthenticated,
  });
}

export function useUnreadNotificationsCountQuery() {
  const { user, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["notifications", "unread-count", user?.id],
    queryFn: async () => {
      const response = await api.get<ApiSuccessResponse<UnreadNotificationsCountResponse>>(
        "/notifications/unread-count",
      );
      return response.data.data.unreadCount;
    },
    enabled: isAuthenticated,
    refetchInterval: 60000,
  });
}
