import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Field } from "@/types/fields";

type ApiSuccessResponse<T> = {
  success: boolean;
  data: T;
};

type FieldsListResponse = {
  items: Field[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export function useTeamFieldsQuery(teamId: string) {
  return useQuery({
    queryKey: ["fields", "team", teamId],
    queryFn: async () => {
      const response = await api.get<ApiSuccessResponse<FieldsListResponse>>("/fields", {
        params: {
          teamId,
          page: 1,
          limit: 50,
        },
      });

      return response.data.data.items;
    },
    enabled: Boolean(teamId),
  });
}

export function useFieldQuery(fieldId: string) {
  return useQuery({
    queryKey: ["fields", fieldId],
    queryFn: async () => {
      const response = await api.get<ApiSuccessResponse<Field>>(`/fields/${fieldId}`);
      return response.data.data;
    },
    enabled: Boolean(fieldId),
  });
}
