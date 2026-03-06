import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { CreateFieldPayload, Field, UpdateFieldPayload } from "@/types/fields";

type ApiSuccessResponse<T> = {
  success: boolean;
  data: T;
};

export function useCreateFieldMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateFieldPayload) => {
      const response = await api.post<ApiSuccessResponse<Field>>("/fields", payload);
      return response.data.data;
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["fields"] });
      await queryClient.invalidateQueries({ queryKey: ["teams", variables.teamId] });
    },
  });
}

export function useUpdateFieldMutation(fieldId: string, teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateFieldPayload) => {
      const response = await api.patch<ApiSuccessResponse<Field>>(
        `/fields/${fieldId}`,
        payload,
      );
      return response.data.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["fields", fieldId] });
      await queryClient.invalidateQueries({ queryKey: ["fields", "team", teamId] });
      await queryClient.invalidateQueries({ queryKey: ["teams", teamId] });
    },
  });
}
