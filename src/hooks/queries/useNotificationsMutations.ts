import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

type ApiSuccessResponse<T> = {
  success: boolean;
  data: T;
};

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await api.patch<ApiSuccessResponse<unknown>>(
        `/notifications/${notificationId}/read`,
      );
      return response.data.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
