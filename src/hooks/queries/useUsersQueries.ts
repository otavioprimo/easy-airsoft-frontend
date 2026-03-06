import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { UserProfile } from "@/types/users";

type ApiSuccessResponse<T> = {
  success: boolean;
  data: T;
};

export function useMyProfileQuery() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["users", "me"],
    queryFn: async () => {
      const response = await api.get<ApiSuccessResponse<UserProfile>>("/users/me");
      return response.data.data;
    },
    enabled: isAuthenticated,
  });
}
