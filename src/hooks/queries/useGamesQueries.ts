import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { LocationDateFilters } from "@/types/filters";
import type {
  CreateGamePayload,
  GameItem,
  ListGamesResponse,
  ParticipationStatus,
  UpdateGamePayload,
} from "@/types/games";

type ApiSuccessResponse<T> = {
  success: boolean;
  data: T;
};

export function useGamesQuery(
  filters: LocationDateFilters,
  location?: { latitude: number; longitude: number } | null,
) {
  return useQuery({
    queryKey: ["games", filters, location],
    queryFn: async () => {
      const response = await api.get<ApiSuccessResponse<ListGamesResponse>>(
        "/games/secure",
        {
          params: {
            page: 1,
            limit: 15,
            radiusKm: filters.radiusKm,
            ...(location ? { latitude: location.latitude } : {}),
            ...(location ? { longitude: location.longitude } : {}),
            ...(filters.city.trim() ? { city: filters.city.trim() } : {}),
            ...(filters.state.trim()
              ? { state: filters.state.trim().toUpperCase() }
              : {}),
            ...(filters.date ? { date: filters.date } : {}),
            ...(filters.followingOnly ? { followingOnly: true } : {}),
          },
        },
      );

      return response.data.data.items;
    },
  });
}

export function useMyParticipationGamesQuery() {
  return useQuery({
    queryKey: ["games", "my-participation"],
    queryFn: async () => {
      const response = await api.get<ApiSuccessResponse<ListGamesResponse>>(
        "/games/secure",
        {
          params: {
            page: 1,
            limit: 50,
          },
        },
      );

      return response.data.data.items;
    },
  });
}

export function useGameDetailsQuery(gameId: string) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["games", "details", gameId, isAuthenticated ? "secure" : "public"],
    enabled: Boolean(gameId),
    queryFn: async () => {
      const response = await api.get<ApiSuccessResponse<GameItem>>(
        isAuthenticated ? `/games/${gameId}/secure` : `/games/${gameId}`,
      );

      return response.data.data;
    },
  });
}

export function useTeamGamesQuery(teamId: string) {
  return useQuery({
    queryKey: ["games", "team", teamId],
    enabled: Boolean(teamId),
    queryFn: async () => {
      const response = await api.get<ApiSuccessResponse<ListGamesResponse>>(
        "/games",
        {
          params: {
            page: 1,
            limit: 50,
            teamId,
          },
        },
      );

      return response.data.data.items;
    },
  });
}

export function useTeamGamesSecureQuery(teamId: string) {
  return useQuery({
    queryKey: ["games", "team", "secure", teamId],
    enabled: Boolean(teamId),
    queryFn: async () => {
      const response = await api.get<ApiSuccessResponse<ListGamesResponse>>(
        "/games/secure",
        {
          params: {
            page: 1,
            limit: 50,
            teamId,
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

export function useCreateGameMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateGamePayload) => {
      const response = await api.post<ApiSuccessResponse<GameItem>>("/games", payload);
      return response.data.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["games"] });
    },
  });
}

export function useUpdateGameMutation(gameId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateGamePayload) => {
      const response = await api.patch<ApiSuccessResponse<GameItem>>(
        `/games/${gameId}`,
        payload,
      );
      return response.data.data;
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
