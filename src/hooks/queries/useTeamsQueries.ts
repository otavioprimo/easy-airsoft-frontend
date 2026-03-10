import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type {
  ListTeamsResponse,
  Team,
  TeamFollowing,
  TeamMember,
} from "@/types/teams";

type ApiSuccessResponse<T> = {
  success: boolean;
  data: T;
};

export function useMyTeamsQuery() {
  const { user, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["teams", "me", user?.id],
    queryFn: async () => {
      const response = await api.get<ApiSuccessResponse<Team[]>>("/teams/me");
      return response.data.data;
    },
    enabled: isAuthenticated,
  });
}

export function useTeamQuery(teamId: string) {
  return useQuery({
    queryKey: ["teams", teamId],
    queryFn: async () => {
      const response = await api.get<ApiSuccessResponse<Team>>(
        `/teams/${teamId}`,
      );
      return response.data.data;
    },
    enabled: Boolean(teamId),
  });
}

export function useTeamMembersQuery(teamId: string) {
  return useQuery({
    queryKey: ["teams", teamId, "members"],
    queryFn: async () => {
      const response = await api.get<ApiSuccessResponse<TeamMember[]>>(
        `/teams/${teamId}/members`,
      );
      return response.data.data;
    },
    enabled: Boolean(teamId),
  });
}

export function useFollowingTeamsQuery() {
  const { user, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["followers", "teams", user?.id],
    queryFn: async () => {
      const response = await api.get<ApiSuccessResponse<TeamFollowing[]>>(
        "/followers/teams",
      );
      return response.data.data;
    },
    enabled: isAuthenticated,
  });
}

export function useSearchTeamsQuery(filters: {
  name: string;
  city: string;
  state: string;
}) {
  return useQuery({
    queryKey: ["teams", "search", filters],
    queryFn: async () => {
      const response = await api.get<ApiSuccessResponse<ListTeamsResponse>>(
        "/teams",
        {
          params: {
            page: 1,
            limit: 30,
            ...(filters.name.trim() ? { name: filters.name.trim() } : {}),
            ...(filters.city.trim() ? { city: filters.city.trim() } : {}),
            ...(filters.state.trim()
              ? { state: filters.state.trim().toUpperCase() }
              : {}),
          },
        },
      );

      return response.data.data;
    },
  });
}
