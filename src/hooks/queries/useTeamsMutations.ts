import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { CreateTeamPayload, Team } from "@/types/teams";

type ApiSuccessResponse<T> = {
  success: boolean;
  data: T;
};

export function useCreateTeamMutation() {
  return useMutation({
    mutationFn: async (payload: CreateTeamPayload) => {
      const response = await api.post<ApiSuccessResponse<Team>>(
        "/teams",
        payload,
      );
      return response.data.data;
    },
  });
}
