import { Link, useParams } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useTeamFieldsQuery } from "@/hooks/queries/useFieldsQueries";
import { useTeamMembersQuery, useTeamQuery } from "@/hooks/queries/useTeamsQueries";
import type { TeamRole } from "@/types/teams";

export default function TeamOverviewPage() {
  const { teamId = "" } = useParams();
  const { user } = useAuth();

  const teamQuery = useTeamQuery(teamId);
  const membersQuery = useTeamMembersQuery(teamId);
  const fieldsQuery = useTeamFieldsQuery(teamId);

  const currentUserMembership = (membersQuery.data ?? []).find((member) => {
    return member.userId === user?.id;
  });

  const currentUserRole = currentUserMembership?.role as TeamRole | undefined;
  const canManageTeam = currentUserRole === "OWNER" || currentUserRole === "ADMIN";

  if (teamQuery.isLoading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-4xl space-y-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
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
  const fields = fieldsQuery.data ?? [];

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="rounded-3xl border border-primary/20 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {team.logoUrl ? (
                <img
                  src={team.logoUrl}
                  alt={`Logo do time ${team.name}`}
                  className="h-16 w-16 rounded-xl border border-gray-200 object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-xl font-bold text-primary">
                  {team.name.charAt(0).toUpperCase()}
                </div>
              )}

              <div>
                <h1 className="text-2xl font-bold text-primary">{team.name}</h1>
                <p className="mt-1 text-sm text-gray-600">
                  {team.city && team.state
                    ? `${team.city}/${team.state}`
                    : "Localização não informada"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link to="/app">
                <Button variant="outline">Voltar para Home</Button>
              </Link>
              {canManageTeam && (
                <Link to={`/app/teams/${team.id}/fields/new`}>
                  <Button variant="outline">Criar campo</Button>
                </Link>
              )}
              {canManageTeam && (
                <Link to={`/app/teams/${team.id}/edit`}>
                  <Button>Gerenciar time</Button>
                </Link>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-2 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-primary">Sobre o time</h2>
          <p className="text-sm text-gray-700">
            {team.description || "Sem descrição cadastrada."}
          </p>
        </section>

        <section className="space-y-3 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary">Campos do time</h2>
            <span className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-600">
              {fieldsQuery.isLoading ? "..." : fields.length} campo(s)
            </span>
          </div>

          {fieldsQuery.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : fields.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
              Este time ainda não possui campos cadastrados.
            </div>
          ) : (
            <div className="grid gap-3">
              {fields.map((field) => (
                <div
                  key={field.id}
                  className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-900">{field.name}</p>
                    <p className="text-sm text-gray-600">
                      {field.city}/{field.state}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {field.photos?.[0]?.photoUrl ? (
                      <img
                        src={field.photos[0].photoUrl}
                        alt={`Foto do campo ${field.name}`}
                        className="h-12 w-16 rounded-md border border-gray-200 object-cover"
                      />
                    ) : (
                      <span className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-500">
                        Sem foto
                      </span>
                    )}

                    {canManageTeam && (
                      <Link to={`/app/teams/${team.id}/fields/${field.id}/edit`}>
                        <Button variant="outline" size="sm">
                          Editar
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
