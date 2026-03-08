import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Label } from "@/components/ui/label";
import { SearchSelect } from "@/components/ui/search-select";
import { useCreateGameMutation, getQueryErrorMessage } from "@/hooks/queries/useGamesQueries";
import { useTeamFieldsQuery } from "@/hooks/queries/useFieldsQueries";
import { useMyTeamsQuery } from "@/hooks/queries/useTeamsQueries";

const createGameSchema = z.object({
  teamId: z.string().min(1, "Selecione o time responsável"),
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
});

type CreateGameFormData = z.infer<typeof createGameSchema>;

export default function CreateGamePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const myTeamsQuery = useMyTeamsQuery();
  const createGameMutation = useCreateGameMutation();
  const preferredTeamId = (searchParams.get("teamId") || "").trim();

  const manageableTeams = (myTeamsQuery.data ?? []).filter((team) => {
    return team.currentUserRole === "OWNER" || team.currentUserRole === "ADMIN";
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateGameFormData>({
    resolver: zodResolver(createGameSchema),
    defaultValues: {
      teamId: "",
      fieldId: "",
      title: "",
      description: "",
      datetime: "",
      maxPlayers: "",
      price: "",
      externalTicketUrl: "",
    },
  });

  const selectedTeamId = watch("teamId") || "";
  const selectedFieldId = watch("fieldId") || "";
  const teamFieldsQuery = useTeamFieldsQuery(selectedTeamId);

  useEffect(() => {
    if (!manageableTeams.length) {
      return;
    }

    const currentTeamId = selectedTeamId;
    const teamExists = manageableTeams.some((team) => team.id === currentTeamId);

    if (currentTeamId && teamExists) {
      return;
    }

    const preferredTeamExists = manageableTeams.some(
      (team) => team.id === preferredTeamId,
    );

    if (preferredTeamId && preferredTeamExists) {
      setValue("teamId", preferredTeamId, { shouldValidate: true });
      setValue("fieldId", "", { shouldValidate: true });
      return;
    }

    setValue("teamId", manageableTeams[0].id, { shouldValidate: true });
    setValue("fieldId", "", { shouldValidate: true });
  }, [manageableTeams, preferredTeamId, selectedTeamId, setValue]);

  useEffect(() => {
    const fields = teamFieldsQuery.data ?? [];
    const hasCurrentField = fields.some((field) => field.id === selectedFieldId);

    if (!fields.length) {
      setValue("fieldId", "", { shouldValidate: true });
      return;
    }

    if (!selectedFieldId || !hasCurrentField) {
      setValue("fieldId", fields[0].id, { shouldValidate: true });
    }
  }, [teamFieldsQuery.data, selectedFieldId, setValue]);

  const onSubmit = async (data: CreateGameFormData) => {
    try {
      await createGameMutation.mutateAsync({
        teamId: data.teamId,
        fieldId: data.fieldId,
        title: data.title.trim(),
        description: data.description?.trim() || undefined,
        datetime: new Date(data.datetime).toISOString(),
        maxPlayers: data.maxPlayers ? Number(data.maxPlayers) : undefined,
        price: data.price ? Number(data.price) : undefined,
        externalTicketUrl: data.externalTicketUrl?.trim() || undefined,
      });

      navigate("/app");
    } catch {
      // error handled below
    }
  };

  const errorMessage =
    (createGameMutation.error &&
      getQueryErrorMessage(createGameMutation.error, "Não foi possível criar o jogo.")) ||
    "";

  if (myTeamsQuery.isLoading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-4xl rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-600">Carregando seus times...</p>
        </div>
      </AppShell>
    );
  }

  if (myTeamsQuery.isError) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl space-y-3 rounded-2xl border border-red-300 bg-red-50 p-4 text-red-800">
          <p>Não foi possível carregar os times.</p>
          <Link to="/app">
            <Button variant="outline">Voltar para Home</Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  if (!manageableTeams.length) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl space-y-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900">
          <p>Você precisa ser OWNER ou ADMIN de um time para criar jogos.</p>
          <Link to="/app/teams/new">
            <Button>Criar time</Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  const fields = teamFieldsQuery.data ?? [];

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-3xl border border-primary/20 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-primary">Criar jogo</h1>
          <p className="mt-1 text-sm text-gray-600">
            Configure os dados da partida e publique para os jogadores.
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

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="teamId">Time responsável</Label>
                <SearchSelect
                  items={manageableTeams.map((team) => ({
                    value: team.id,
                    label: team.name,
                  }))}
                  value={selectedTeamId}
                  onChange={(nextTeamId) => {
                    setValue("teamId", nextTeamId, { shouldValidate: true });
                    setValue("fieldId", "", { shouldValidate: true });
                  }}
                  placeholder="Selecione o time"
                  searchPlaceholder="Buscar time..."
                  emptyText="Nenhum time encontrado."
                />
                {errors.teamId && (
                  <p className="text-sm text-red-600">{errors.teamId.message}</p>
                )}
              </div>

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
                  placeholder={!selectedTeamId
                    ? "Selecione um time"
                    : teamFieldsQuery.isLoading
                      ? "Carregando campos..."
                      : fields.length === 0
                        ? "Nenhum campo cadastrado"
                        : "Selecione o campo"}
                  searchPlaceholder="Buscar campo..."
                  emptyText="Nenhum campo encontrado."
                  disabled={!selectedTeamId || teamFieldsQuery.isLoading || !fields.length}
                />
                {errors.fieldId && (
                  <p className="text-sm text-red-600">{errors.fieldId.message}</p>
                )}
              </div>
            </div>

            {selectedTeamId && !teamFieldsQuery.isLoading && fields.length === 0 && (
              <div className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                Este time ainda não tem campo. Crie um campo primeiro.
                <div className="mt-2">
                  <Link to={`/app/teams/${selectedTeamId}/fields/new`}>
                    <Button variant="outline" size="sm">Criar campo</Button>
                  </Link>
                </div>
              </div>
            )}
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
              disabled={
                isSubmitting ||
                createGameMutation.isPending ||
                !selectedTeamId ||
                fields.length === 0
              }
            >
              {isSubmitting || createGameMutation.isPending
                ? "Criando jogo..."
                : "Criar jogo"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/app")}
              disabled={isSubmitting || createGameMutation.isPending}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
