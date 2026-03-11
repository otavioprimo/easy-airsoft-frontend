import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type {
  PaginatedListResponse,
  PublicProfileGameItem,
  PublicProfileMembershipItem,
  PublicProfileTeamItem,
  PublicUserProfile,
  UserProfile,
} from "@/types/users";

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

export function usePublicProfileByUsernameQuery(username: string | undefined) {
  return useQuery({
    queryKey: ["users", "profile", username],
    queryFn: async () => {
      const response = await api.get<ApiSuccessResponse<PublicUserProfile>>(
        `/users/profile/${username}`
      );
      return response.data.data;
    },
    enabled: !!username,
  });
}

export function usePublicProfileGamesQuery(
  username: string | undefined,
  page: number,
  enabled = true,
) {
  return useQuery({
    queryKey: ["users", "profile", username, "games", page],
    queryFn: async () => {
      const response = await api.get<ApiSuccessResponse<PaginatedListResponse<PublicProfileGameItem>>>(
        `/users/profile/${username}/games`,
        {
          params: { page, limit: 5 },
        },
      );
      return response.data.data;
    },
    enabled: Boolean(username) && enabled,
  });
}

export function usePublicProfileTeamsQuery(
  username: string | undefined,
  page: number,
  enabled = true,
) {
  return useQuery({
    queryKey: ["users", "profile", username, "teams", page],
    queryFn: async () => {
      const response = await api.get<ApiSuccessResponse<PaginatedListResponse<PublicProfileMembershipItem>>>(
        `/users/profile/${username}/teams`,
        {
          params: { page, limit: 5 },
        },
      );
      return response.data.data;
    },
    enabled: Boolean(username) && enabled,
  });
}

export function usePublicProfileFollowingTeamsQuery(
  username: string | undefined,
  page: number,
  enabled = true,
) {
  return useQuery({
    queryKey: ["users", "profile", username, "following-teams", page],
    queryFn: async () => {
      const response = await api.get<ApiSuccessResponse<PaginatedListResponse<PublicProfileTeamItem>>>(
        `/users/profile/${username}/following-teams`,
        {
          params: { page, limit: 5 },
        },
      );
      return response.data.data;
    },
    enabled: Boolean(username) && enabled,
  });
}

