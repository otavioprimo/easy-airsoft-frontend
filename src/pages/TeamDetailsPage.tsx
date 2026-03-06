import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { TeamMembersPanel } from "@/components/team/TeamMembersPanel";
import { Button } from "@/components/ui/button";
import { FileDropzone } from "@/components/ui/file-dropzone";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import {
  useIbgeCitiesByStateQuery,
  useIbgeStatesQuery,
} from "@/hooks/queries/useIbgeQueries";
import {
  useDeleteTeamMutation,
  useGenerateTeamInviteCodeMutation,
  useRemoveTeamMemberMutation,
  useSetTeamMemberRoleMutation,
  useUpdateTeamMutation,
} from "@/hooks/queries/useTeamsMutations";
import { useUploadImageMutation } from "@/hooks/queries/useUploadsMutations";
import { buildTeamInviteDeepLink } from "@/lib/team-invite";
import { useTeamMembersQuery, useTeamQuery } from "@/hooks/queries/useTeamsQueries";
import type { TeamRole } from "@/types/teams";

function getApiErrorMessage(error: unknown, fallback: string) {
  const apiError = error as {
    response?: {
      data?: {
        message?: string;
      };
    };
  };

  return apiError.response?.data?.message || fallback;
}

const editTeamSchema = z.object({
  name: z
    .string()
    .min(2, "Nome do time é obrigatório")
    .max(120, "Nome do time deve ter no máximo 120 caracteres"),
  description: z
    .string()
    .max(500, "Descrição deve ter no máximo 500 caracteres")
    .optional()
    .or(z.literal("")),
  state: z.string().max(2, "Estado inválido").optional().or(z.literal("")),
  city: z.string().max(100, "Cidade inválida").optional().or(z.literal("")),
});

type EditTeamFormData = z.infer<typeof editTeamSchema>;

function normalizeUpdatePayload(data: EditTeamFormData, logoUrl?: string) {
  return {
    name: data.name.trim(),
    description: data.description?.trim() || undefined,
    state: data.state?.trim().toUpperCase() || undefined,
    city: data.city?.trim() || undefined,
    logoUrl,
  };
}

export default function TeamDetailsPage() {
  const navigate = useNavigate();
  const { teamId = "" } = useParams();
  const { user } = useAuth();
  const [teamErrorMessage, setTeamErrorMessage] = useState("");
  const [teamSuccessMessage, setTeamSuccessMessage] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
  const [logoFilename, setLogoFilename] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [inviteExpiresAt, setInviteExpiresAt] = useState("");
  const [inviteErrorMessage, setInviteErrorMessage] = useState("");
  const [inviteSuccessMessage, setInviteSuccessMessage] = useState("");
  const [membersErrorMessage, setMembersErrorMessage] = useState("");
  const [membersSuccessMessage, setMembersSuccessMessage] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [deleteErrorMessage, setDeleteErrorMessage] = useState("");
  const teamQuery = useTeamQuery(teamId);
  const membersQuery = useTeamMembersQuery(teamId);
  const statesQuery = useIbgeStatesQuery();
  const generateInviteCodeMutation = useGenerateTeamInviteCodeMutation(teamId);
  const updateTeamMutation = useUpdateTeamMutation(teamId);
  const deleteTeamMutation = useDeleteTeamMutation(teamId);
  const uploadImageMutation = useUploadImageMutation();
  const setTeamMemberRoleMutation = useSetTeamMemberRoleMutation(teamId);
  const removeTeamMemberMutation = useRemoveTeamMemberMutation(teamId);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditTeamFormData>({
    resolver: zodResolver(editTeamSchema),
    defaultValues: {
      name: "",
      description: "",
      state: "",
      city: "",
    },
  });

  const currentUserMembership = (membersQuery.data ?? []).find((member) => {
    return member.userId === user?.id;
  });

  const currentUserRole = currentUserMembership?.role as TeamRole | undefined;
  const canManageTeam = currentUserRole === "OWNER" || currentUserRole === "ADMIN";
  const canDeleteTeam = currentUserRole === "OWNER";

  const stateValue = (watch("state") || "").trim().toUpperCase();
  const cityValue = watch("city") || "";
  const citiesQuery = useIbgeCitiesByStateQuery(stateValue);

  useEffect(() => {
    const team = teamQuery.data;

    if (!team) {
      return;
    }

    reset({
      name: team.name,
      description: team.description || "",
      state: team.state || "",
      city: team.city || "",
    });

    setLogoUrl(team.logoUrl || undefined);
    setLogoFilename(team.logoUrl ? "Logo atual" : "");
  }, [teamQuery.data, reset]);

  const handleLogoFileSelect = async (file: File) => {
    setTeamErrorMessage("");

    try {
      const uploadResult = await uploadImageMutation.mutateAsync({
        file,
        folder: "teams",
      });

      setLogoUrl(uploadResult.fileUrl);
      setLogoFilename(file.name);
    } catch (error) {
      const uploadError = error as { message?: string };
      setTeamErrorMessage(uploadError.message || "Não foi possível enviar o logo.");
    }
  };

  const handleUpdateTeam = async (data: EditTeamFormData) => {
    setTeamErrorMessage("");
    setTeamSuccessMessage("");

    try {
      await updateTeamMutation.mutateAsync(normalizeUpdatePayload(data, logoUrl));
      setTeamSuccessMessage("Dados do time atualizados com sucesso.");
    } catch (error) {
      setTeamErrorMessage(
        getApiErrorMessage(error, "Não foi possível atualizar os dados do time."),
      );
    }
  };

  const handleGenerateInviteCode = () => {
    setInviteErrorMessage("");
    setInviteSuccessMessage("");

    generateInviteCodeMutation.mutate(
      {
        expiresInDays: 7,
      },
      {
        onSuccess: (data) => {
          setInviteCode(data.inviteCode);
          setInviteExpiresAt(data.expiresAt);
          setInviteSuccessMessage("Código de convite atualizado com sucesso.");
        },
        onError: (error) => {
          setInviteErrorMessage(
            getApiErrorMessage(error, "Não foi possível gerar o código de convite."),
          );
        },
      },
    );
  };

  const handleCopyInviteCode = async () => {
    if (!inviteCode) {
      return;
    }

    await navigator.clipboard.writeText(inviteCode);
    setInviteSuccessMessage("Código copiado para a área de transferência.");
  };

  const handleCopyInviteDeepLink = async () => {
    if (!inviteCode) {
      return;
    }

    const deepLink = buildTeamInviteDeepLink(inviteCode);
    await navigator.clipboard.writeText(deepLink);
    setInviteSuccessMessage("Link de convite copiado para a área de transferência.");
  };

  const handleChangeMemberRole = (
    userId: string,
    role: Exclude<TeamRole, "OWNER">,
  ) => {
    setMembersErrorMessage("");
    setMembersSuccessMessage("");

    setTeamMemberRoleMutation.mutate(
      {
        userId,
        role,
      },
      {
        onSuccess: () => {
          setMembersSuccessMessage("Role do membro atualizada com sucesso.");
        },
        onError: (error) => {
          setMembersErrorMessage(
            getApiErrorMessage(error, "Não foi possível atualizar a role."),
          );
        },
      },
    );
  };

  const handleRemoveMember = (userId: string) => {
    setMembersErrorMessage("");
    setMembersSuccessMessage("");

    removeTeamMemberMutation.mutate(userId, {
      onSuccess: () => {
        setMembersSuccessMessage("Membro removido com sucesso.");
      },
      onError: (error) => {
        setMembersErrorMessage(
          getApiErrorMessage(error, "Não foi possível remover o membro."),
        );
      },
    });
  };

  const handleDeleteTeam = () => {
    if (!canDeleteTeam) {
      return;
    }

    setDeleteErrorMessage("");
    setDeleteConfirmationText("");
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDeleteTeam = () => {
    if (!canDeleteTeam) {
      return;
    }

    setTeamErrorMessage("");
    setTeamSuccessMessage("");
    setDeleteErrorMessage("");

    deleteTeamMutation.mutate(undefined, {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        navigate("/app");
      },
      onError: (error) => {
        const message = getApiErrorMessage(error, "Não foi possível excluir o time.");
        setDeleteErrorMessage(message);
        setTeamErrorMessage(message);
      },
    });
  };

  if (teamQuery.isLoading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl space-y-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-20 w-full" />
        </div>
      </AppShell>
    );
  }

  if (membersQuery.isLoading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl space-y-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-20 w-full" />
        </div>
      </AppShell>
    );
  }

  if (teamQuery.isError || !teamQuery.data) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl space-y-3 rounded-2xl border border-red-300 bg-red-50 p-4 text-red-800">
          <p>Não foi possível carregar o time.</p>
          <Link to="/app">
            <Button variant="outline">Voltar para Home</Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  const team = teamQuery.data;

  if (!canManageTeam) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl space-y-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900">
          <p>Apenas OWNER ou ADMIN podem acessar esta área de gerenciamento.</p>
          <Link to={`/app/teams/${team.id}`}>
            <Button variant="outline">Voltar para o time</Button>
          </Link>
        </div>
      </AppShell>
    );
  }
  const canConfirmDelete = deleteConfirmationText.trim() === team.name;

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-3xl border border-primary/20 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            {team.logoUrl ? (
              <img
                src={team.logoUrl}
                alt={`Logo do time ${team.name}`}
                className="h-16 w-16 rounded-xl object-cover border border-gray-200"
              />
            ) : (
              <div className="h-16 w-16 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-xl font-bold">
                {team.name.charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <h1 className="text-2xl font-bold text-primary">Gerenciar {team.name}</h1>
              <p className="text-sm text-gray-600 mt-1">
                {team.city && team.state
                  ? `${team.city}/${team.state}`
                  : "Localização não informada"}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-primary">Sobre o time</h2>
          <p className="text-sm text-gray-700">
            {team.description || "Sem descrição cadastrada."}
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Link to={`/app/teams/${team.id}`}>
              <Button variant="outline">Ver página do time</Button>
            </Link>
            <Link to={`/app/teams/${team.id}/fields/new`}>
              <Button>Criar campo do time</Button>
            </Link>
          </div>
        </div>

        {canManageTeam && (
          <section
            className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <form
              onSubmit={handleSubmit(handleUpdateTeam)}
              className="space-y-4"
            >
            <div>
              <h2 className="text-lg font-semibold text-primary">Editar time</h2>
              <p className="text-sm text-gray-600">
                Atualize os dados públicos do seu time.
              </p>
            </div>

            <FormField
              label="Nome do time"
              placeholder="Ex.: Lobos do Sul"
              error={errors.name?.message}
              {...register("name")}
            />

            <div className="space-y-2">
              <Label htmlFor="team-description">Descrição</Label>
              <textarea
                id="team-description"
                rows={4}
                className="flex w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-sm text-text-dark placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Fale sobre o estilo do time, região de atuação, etc."
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Select
                  id="state"
                  value={stateValue}
                  onChange={(event) => {
                    const nextState = event.target.value;
                    setValue("state", nextState, { shouldValidate: true });
                    setValue("city", "", { shouldValidate: true });
                  }}
                  disabled={statesQuery.isLoading}
                >
                  <option value="">
                    {statesQuery.isLoading ? "Carregando..." : "Selecione"}
                  </option>
                  {(statesQuery.data ?? []).map((stateOption) => (
                    <option key={stateOption.code} value={stateOption.code}>
                      {stateOption.code} - {stateOption.name}
                    </option>
                  ))}
                </Select>
                {errors.state && (
                  <p className="text-sm text-red-600">{errors.state.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Select
                  id="city"
                  value={cityValue}
                  onChange={(event) => {
                    setValue("city", event.target.value, {
                      shouldValidate: true,
                    });
                  }}
                  disabled={!stateValue || citiesQuery.isLoading}
                >
                  <option value="">
                    {!stateValue
                      ? "Selecione um estado"
                      : citiesQuery.isLoading
                        ? "Carregando..."
                        : "Selecione"}
                  </option>
                  {(citiesQuery.data ?? []).map((cityOption) => (
                    <option key={cityOption} value={cityOption}>
                      {cityOption}
                    </option>
                  ))}
                </Select>
                {errors.city && (
                  <p className="text-sm text-red-600">{errors.city.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Logo do time</Label>
              <FileDropzone
                onFileSelect={handleLogoFileSelect}
                disabled={
                  uploadImageMutation.isPending ||
                  isSubmitting ||
                  updateTeamMutation.isPending
                }
              />
              {uploadImageMutation.isPending && (
                <p className="text-sm text-gray-600">Enviando logo...</p>
              )}
              {logoUrl && !uploadImageMutation.isPending && (
                <div className="space-y-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                  <p className="text-sm text-emerald-800">
                    Logo selecionado:{" "}
                    <span className="font-medium">{logoFilename || "Imagem"}</span>
                  </p>
                  <img
                    src={logoUrl}
                    alt="Prévia do logo do time"
                    className="h-16 w-16 rounded-md border border-emerald-200 object-cover"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setLogoUrl(undefined);
                      setLogoFilename("");
                    }}
                    disabled={
                      isSubmitting ||
                      updateTeamMutation.isPending ||
                      uploadImageMutation.isPending
                    }
                  >
                    Remover logo
                  </Button>
                </div>
              )}
            </div>

            {teamErrorMessage && (
              <p className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                {teamErrorMessage}
              </p>
            )}

            {teamSuccessMessage && (
              <p className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {teamSuccessMessage}
              </p>
            )}

            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  updateTeamMutation.isPending ||
                  uploadImageMutation.isPending
                }
              >
                {isSubmitting || updateTeamMutation.isPending
                  ? "Salvando..."
                  : "Salvar alterações"}
              </Button>

              {canDeleteTeam && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDeleteTeam}
                  disabled={
                    isSubmitting ||
                    updateTeamMutation.isPending ||
                    uploadImageMutation.isPending ||
                    deleteTeamMutation.isPending
                  }
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  {deleteTeamMutation.isPending ? "Excluindo..." : "Excluir time"}
                </Button>
              )}
            </div>
            </form>
          </section>
        )}

        <div className="space-y-3 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-primary">
              Convites para o time
            </h2>
            <p className="text-sm text-gray-600">
              Gere um código para compartilhar com novos membros.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={handleGenerateInviteCode}
              disabled={generateInviteCodeMutation.isPending}
            >
              {generateInviteCodeMutation.isPending
                ? "Gerando..."
                : "Gerar código de convite"}
            </Button>

            {inviteCode && (
              <Button variant="outline" onClick={() => void handleCopyInviteCode()}>
                Copiar código
              </Button>
            )}

            {inviteCode && (
              <Button variant="outline" onClick={() => void handleCopyInviteDeepLink()}>
                Copiar deeplink
              </Button>
            )}
          </div>

          {inviteCode && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
              <p>
                Código: <span className="font-semibold tracking-[0.2em]">{inviteCode}</span>
              </p>
              {inviteExpiresAt && (
                <p className="mt-1 text-primary/80">
                  Expira em {new Date(inviteExpiresAt).toLocaleString("pt-BR")}
                </p>
              )}
            </div>
          )}

          {inviteErrorMessage && (
            <p className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
              {inviteErrorMessage}
            </p>
          )}

          {inviteSuccessMessage && (
            <p className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {inviteSuccessMessage}
            </p>
          )}
        </div>

        <TeamMembersPanel
          members={membersQuery.data ?? []}
          currentUserId={user?.id}
          currentUserRole={currentUserRole}
          isLoading={membersQuery.isLoading}
          isUpdatingRole={setTeamMemberRoleMutation.isPending}
          isRemovingMember={removeTeamMemberMutation.isPending}
          errorMessage={membersErrorMessage}
          successMessage={membersSuccessMessage}
          onChangeRole={handleChangeMemberRole}
          onRemoveMember={handleRemoveMember}
        />

        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4">
            <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-red-700">Excluir time</h3>
              <p className="mt-2 text-sm text-gray-700">
                Esta ação faz o arquivamento do time (soft delete) e remove o acesso pelo app.
              </p>
              <p className="mt-2 text-sm text-gray-700">
                Para confirmar, digite o nome do time: <span className="font-semibold">{team.name}</span>
              </p>

              <div className="mt-4 space-y-2">
                <Label htmlFor="delete-team-confirm">Confirmação</Label>
                <Input
                  id="delete-team-confirm"
                  value={deleteConfirmationText}
                  onChange={(event) => {
                    setDeleteConfirmationText(event.target.value);
                  }}
                  placeholder={team.name}
                  disabled={deleteTeamMutation.isPending}
                />
              </div>

              {deleteErrorMessage && (
                <p className="mt-3 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {deleteErrorMessage}
                </p>
              )}

              <div className="mt-5 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (!deleteTeamMutation.isPending) {
                      setIsDeleteModalOpen(false);
                    }
                  }}
                  disabled={deleteTeamMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmDeleteTeam}
                  disabled={!canConfirmDelete || deleteTeamMutation.isPending}
                  className="bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300"
                >
                  {deleteTeamMutation.isPending ? "Excluindo..." : "Confirmar exclusão"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
