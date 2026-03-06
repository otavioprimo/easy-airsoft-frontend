import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { UpdateUserProfilePayload, UserProfile } from "@/types/users";

type ApiSuccessResponse<T> = {
  success: boolean;
  data: T;
};

export function useUpdateMyProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateUserProfilePayload) => {
      const response = await api.patch<ApiSuccessResponse<UserProfile>>(
        "/users/me",
        payload,
      );
      return response.data.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users", "me"] });
    },
  });
}
