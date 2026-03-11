import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Label } from "@/components/ui/label";
import { SearchSelect } from "@/components/ui/search-select";
import {
  getQueryErrorMessage,
  useGameDetailsQuery,
  useUpdateGameMutation,
} from "@/hooks/queries/useGamesQueries";
import { useTeamFieldsQuery } from "@/hooks/queries/useFieldsQueries";
import { useMyTeamsQuery } from "@/hooks/queries/useTeamsQueries";
import type { GameStatus } from "@/types/games";

const GAME_STATUS_LABELS: Record<GameStatus, string> = {
  ACTIVE: "Ativo",
  CANCELLED: "Cancelado",
  FINISHED: "Encerrado",
};

const editGameSchema = z.object({
  fieldId: z.string().min(1, "Selecione o campo"),
  title: z
    .string()
    .min(2, "Título é obrigatório")
    .max(120, "Título deve ter no máximo 120 caracteres"),
  description: z
    .string()
    .max(1000, "Descrição deve ter no máximo 1000 caracteres")
    .optional()
    .or(z.literal("")),
  datetime: z.string().min(1, "Data e horário são obrigatórios"),
  maxPlayers: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || Number.isInteger(Number(value)), "Use um número inteiro")
    .refine((value) => !value || Number(value) >= 1, "Deve ser no mínimo 1 jogador"),
  price: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || !Number.isNaN(Number(value)), "Preço inválido")
    .refine((value) => !value || Number(value) > 0, "Preço deve ser maior que zero"),
  externalTicketUrl: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => !value || /^https:\/\/.+/.test(value),
      "Informe uma URL válida com https://",
    ),
  status: z.enum(["ACTIVE", "CANCELLED", "FINISHED"] as const),
});

type EditGameFormData = z.infer<typeof editGameSchema>;

function toDatetimeLocalValue(isoDateTime: string) {
  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (value: number) => String(value).padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function EditGamePage() {
  const navigate = useNavigate();
  const { gameId = "" } = useParams();

  const gameQuery = useGameDetailsQuery(gameId);
  const updateGameMutation = useUpdateGameMutation(gameId);
  const myTeamsQuery = useMyTeamsQuery();

  const teamId = gameQuery.data?.team?.id ?? "";
  const fieldsQuery = useTeamFieldsQuery(teamId);

  const manageableTeamIds = useMemo(() => {
    return (myTeamsQuery.data ?? [])
      .filter((team) => team.currentUserRole === "OWNER" || team.currentUserRole === "ADMIN")
      .map((team) => team.id);
  }, [myTeamsQuery.data]);

  const canEditGame = Boolean(teamId && manageableTeamIds.includes(teamId));

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EditGameFormData>({
    resolver: zodResolver(editGameSchema),
    defaultValues: {
      fieldId: "",
      title: "",
      description: "",
      datetime: "",
      maxPlayers: "",
      price: "",
      externalTicketUrl: "",
      status: "ACTIVE",
    },
  });

  const selectedFieldId = useWatch({
    control,
    name: "fieldId",
  }) || "";
  const fields = useMemo(() => fieldsQuery.data ?? [], [fieldsQuery.data]);

  useEffect(() => {
    const game = gameQuery.data;

    if (!game) {
      return;
    }

    reset({
      fieldId: game.field?.id ?? "",
      title: game.title,
      description: game.description ?? "",
      datetime: toDatetimeLocalValue(game.datetime),
      maxPlayers: String(game.maxPlayers),
      price: game.price !== null && game.price !== undefined ? String(game.price) : "",
      externalTicketUrl: game.externalTicketUrl ?? "",
      status: (game.status as GameStatus | undefined) ?? "ACTIVE",
    });
  }, [gameQuery.data, reset]);

  useEffect(() => {
    if (!fields.length) {
      return;
    }

    const hasCurrentField = fields.some((field) => field.id === selectedFieldId);
    if (!selectedFieldId || !hasCurrentField) {
      setValue("fieldId", fields[0].id, { shouldValidate: true });
    }
  }, [fields, selectedFieldId, setValue]);

  const onSubmit = async (data: EditGameFormData) => {
    try {
      const updatedGame = await updateGameMutation.mutateAsync({
        fieldId: data.fieldId,
        title: data.title.trim(),
        description: data.description?.trim() || undefined,
        datetime: new Date(data.datetime).toISOString(),
        maxPlayers: data.maxPlayers ? Number(data.maxPlayers) : undefined,
        price: data.price ? Number(data.price) : undefined,
        externalTicketUrl: data.externalTicketUrl?.trim() || undefined,
        status: data.status,
      });

      navigate(`/app/games/${updatedGame.id}`);
    } catch {
      // error handled below
    }
  };

  if (gameQuery.isLoading || myTeamsQuery.isLoading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-4xl rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-600">Carregando dados do jogo...</p>
        </div>
      </AppShell>
    );
  }

  if (gameQuery.isError || !gameQuery.data) {
    const errorMessage = gameQuery.error
      ? getQueryErrorMessage(gameQuery.error, "Não foi possível carregar o jogo.")
      : "Não foi possível carregar o jogo.";

    return (
      <AppShell>
        <div className="mx-auto max-w-3xl space-y-3 rounded-2xl border border-red-300 bg-red-50 p-4 text-red-800">
          <p>{errorMessage}</p>
          <Link to="/app">
            <Button variant="outline">Voltar para Home</Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  if (!canEditGame) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl space-y-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900">
          <p>Apenas OWNER ou ADMIN do time responsável podem editar este jogo.</p>
          <Link to={`/app/games/${gameId}`}>
            <Button variant="outline">Voltar para detalhes do jogo</Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  const errorMessage =
    (updateGameMutation.error &&
      getQueryErrorMessage(updateGameMutation.error, "Não foi possível atualizar o jogo.")) ||
    "";

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-3xl border border-primary/20 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-primary">Editar jogo</h1>
          <p className="mt-1 text-sm text-gray-600">
            Atualize os dados da partida e salve as alterações.
          </p>
        </div>

        {errorMessage && (
          <div className="rounded-2xl border border-red-300 bg-red-50/80 p-4 text-red-800">
            {errorMessage}
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <section className="space-y-4 rounded-2xl border border-gray-200 p-4">
            <h2 className="text-base font-semibold text-gray-900">Organização</h2>

            <div className="space-y-2">
              <Label htmlFor="fieldId">Campo</Label>
              <SearchSelect
                items={fields.map((field) => ({
                  value: field.id,
                  label: `${field.name} • ${field.city}/${field.state}`,
                }))}
                value={selectedFieldId}
                onChange={(nextFieldId) => {
                  setValue("fieldId", nextFieldId, { shouldValidate: true });
                }}
                placeholder={fieldsQuery.isLoading
                  ? "Carregando campos..."
                  : fields.length === 0
                    ? "Nenhum campo cadastrado"
                    : "Selecione o campo"}
                searchPlaceholder="Buscar campo..."
                emptyText="Nenhum campo encontrado."
                disabled={fieldsQuery.isLoading || !fields.length}
              />
              {errors.fieldId && (
                <p className="text-sm text-red-600">{errors.fieldId.message}</p>
              )}
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border border-gray-200 p-4">
            <h2 className="text-base font-semibold text-gray-900">Status do jogo</h2>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="flex w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-sm text-text-dark focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                {...register("status")}
              >
                {(Object.keys(GAME_STATUS_LABELS) as GameStatus[]).map((statusKey) => (
                  <option key={statusKey} value={statusKey}>
                    {GAME_STATUS_LABELS[statusKey]}
                  </option>
                ))}
              </select>
              {errors.status && (
                <p className="text-sm text-red-600">{errors.status.message}</p>
              )}
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border border-gray-200 p-4">
            <h2 className="text-base font-semibold text-gray-900">Detalhes do jogo</h2>

            <FormField
              label="Título"
              placeholder="Ex.: Operação Noturna"
              error={errors.title?.message}
              {...register("title")}
            />

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <textarea
                id="description"
                rows={4}
                className="flex w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-sm text-text-dark placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                placeholder="Objetivos, regras e observações da partida"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="Data e horário"
                type="datetime-local"
                error={errors.datetime?.message}
                {...register("datetime")}
              />

              <FormField
                label="Máx. de jogadores (opcional)"
                type="number"
                min={1}
                placeholder="Ex.: 20"
                error={errors.maxPlayers?.message}
                {...register("maxPlayers")}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="Valor de inscrição (opcional)"
                type="number"
                step="0.01"
                min={0}
                placeholder="Ex.: 80"
                error={errors.price?.message}
                {...register("price")}
              />

              <FormField
                label="Link de ingresso (opcional)"
                placeholder="https://..."
                error={errors.externalTicketUrl?.message}
                {...register("externalTicketUrl")}
              />
            </div>
          </section>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              type="submit"
              disabled={isSubmitting || updateGameMutation.isPending}
            >
              {isSubmitting || updateGameMutation.isPending
                ? "Salvando..."
                : "Salvar alterações"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isSubmitting || updateGameMutation.isPending}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
