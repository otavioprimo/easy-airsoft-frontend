import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Team } from "@/types/teams";

type ApiSuccessResponse<T> = {
  success: boolean;
  data: T;
};

export function useMyTeamsQuery() {
  return useQuery({
    queryKey: ["teams", "me"],
    queryFn: async () => {
      const response = await api.get<ApiSuccessResponse<Team[]>>("/teams/me");
      return response.data.data;
    },
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
