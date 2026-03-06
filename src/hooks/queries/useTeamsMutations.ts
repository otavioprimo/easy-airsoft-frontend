import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  CreateTeamPayload,
  JoinTeamByCodePayload,
  JoinTeamByCodeResponse,
  SetTeamMemberRolePayload,
  Team,
  TeamInviteCodePayload,
  TeamInviteCodeResponse,
  UpdateTeamPayload,
} from "@/types/teams";

type ApiSuccessResponse<T> = {
  success: boolean;
  data: T;
};

export function useCreateTeamMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateTeamPayload) => {
      const response = await api.post<ApiSuccessResponse<Team>>(
        "/teams",
        payload,
      );
      return response.data.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["teams", "me"] });
    },
  });
}

export function useUpdateTeamMutation(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateTeamPayload) => {
      const response = await api.patch<ApiSuccessResponse<Team>>(
        `/teams/${teamId}`,
        payload,
      );
      return response.data.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["teams", teamId] });
      await queryClient.invalidateQueries({ queryKey: ["teams", "me"] });
    },
  });
}

export function useGenerateTeamInviteCodeMutation(teamId: string) {
  return useMutation({
    mutationFn: async (payload?: TeamInviteCodePayload) => {
      const response = await api.post<ApiSuccessResponse<TeamInviteCodeResponse>>(
        `/teams/${teamId}/invite-code`,
        payload ?? {},
      );
      return response.data.data;
    },
  });
}

export function useDeleteTeamMutation(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.delete<ApiSuccessResponse<{ deleted: boolean }>>(
        `/teams/${teamId}`,
      );
      return response.data.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["teams", "me"] });
      await queryClient.invalidateQueries({ queryKey: ["teams", teamId] });
      await queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}

export function useJoinTeamByCodeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: JoinTeamByCodePayload) => {
      const response = await api.post<ApiSuccessResponse<JoinTeamByCodeResponse>>(
        "/teams/join",
        payload,
      );
      return response.data.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["teams", "me"] });
      await queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}

export function useSetTeamMemberRoleMutation(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SetTeamMemberRolePayload) => {
      const response = await api.patch<ApiSuccessResponse<unknown>>(
        `/teams/${teamId}/members/role`,
        payload,
      );
      return response.data.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["teams", teamId, "members"],
      });
    },
  });
}

export function useRemoveTeamMemberMutation(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await api.delete<ApiSuccessResponse<unknown>>(
        `/teams/${teamId}/members/${userId}`,
      );
      return response.data.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["teams", teamId, "members"],
      });
    },
  });
}
