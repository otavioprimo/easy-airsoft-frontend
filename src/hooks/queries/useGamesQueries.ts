import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { LocationDateFilters } from "@/types/filters";
import type {
  GameItem,
  ListGamesResponse,
  ParticipationStatus,
} from "@/types/games";

type ApiSuccessResponse<T> = {
  success: boolean;
  data: T;
};

export function useGamesQuery(filters: LocationDateFilters) {
  return useQuery({
    queryKey: ["games", filters],
    queryFn: async () => {
      const response = await api.get<ApiSuccessResponse<ListGamesResponse>>(
        "/games",
        {
          params: {
            page: 1,
            limit: 20,
            ...(filters.city.trim() ? { city: filters.city.trim() } : {}),
            ...(filters.state.trim()
              ? { state: filters.state.trim().toUpperCase() }
              : {}),
            ...(filters.date ? { date: filters.date } : {}),
          },
        },
      );

      return response.data.data.items;
    },
  });
}

export function useUpdateParticipationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      gameId,
      status,
    }: {
      gameId: string;
      status: ParticipationStatus;
    }) => {
      await api.patch(`/games/${gameId}/participation`, {
        status,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["games"] });
    },
  });
}

export function getQueryErrorMessage(error: unknown, fallback: string) {
  const apiError = error as {
    response?: {
      data?: {
        message?: string;
      };
    };
  };

  return apiError.response?.data?.message || fallback;
}

export function getActiveGameActionLoadingState(
  mutation: ReturnType<typeof useUpdateParticipationMutation>,
  gameId: string,
) {
  return mutation.isPending && mutation.variables?.gameId === gameId;
}

export function ensureGameList(data: GameItem[] | undefined) {
  return data ?? [];
}
