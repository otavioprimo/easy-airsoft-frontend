import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { CreateReviewPayload } from "@/types/reviews";

type ApiSuccessResponse<T> = {
  success: boolean;
  data: T;
};

export function useCreateFieldReviewMutation(fieldId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateReviewPayload) => {
      const normalizedPayload = {
        rating: payload.rating,
        review: payload.review ?? payload.comment,
      };

      const response = await api.post<ApiSuccessResponse<unknown>>(
        `/fields/${fieldId}/reviews`,
        normalizedPayload,
      );
      return response.data.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["fields", fieldId] });
    },
  });
}

export function useCreateGameReviewMutation(gameId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateReviewPayload) => {
      const normalizedPayload = {
        rating: payload.rating,
        review: payload.review ?? payload.comment,
      };

      const response = await api.post<ApiSuccessResponse<unknown>>(
        `/reviews/games/${gameId}`,
        normalizedPayload,
      );
      return response.data.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["games", "details", gameId] });
    },
  });
}
