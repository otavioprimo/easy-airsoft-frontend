import { Link } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyTeamsQuery } from "@/hooks/queries/useTeamsQueries";

export default function MyTeamsPage() {
  const myTeamsQuery = useMyTeamsQuery();
  const teams = myTeamsQuery.data ?? [];

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="rounded-3xl border border-primary/20 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-primary">Meus times</h1>
              <p className="mt-1 text-sm text-gray-600">
                Selecione um time para abrir o overview.
              </p>
            </div>

            <Button asChild>
              <Link to="/app/teams/new">Criar time</Link>
            </Button>
          </div>
        </header>

        {myTeamsQuery.isLoading ? (
          <section className="space-y-3 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </section>
        ) : teams.length === 0 ? (
          <section className="rounded-3xl border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
            Você ainda não participa de nenhum time.
          </section>
        ) : (
          <section className="space-y-3 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            {teams.map((team) => (
              <Link
                key={team.id}
                to={`/teams/${team.id}`}
                className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 transition-colors hover:border-primary hover:bg-primary/5"
              >
                {team.logoUrl ? (
                  <img
                    src={team.logoUrl}
                    alt={`Logo do time ${team.name}`}
                    className="h-11 w-11 rounded-lg border border-gray-200 object-cover"
                  />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-sm font-bold text-primary">
                    {team.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0">
                  <p className="truncate font-semibold text-gray-900">{team.name}</p>
                  <p className="text-sm text-gray-600">
                    {team.city && team.state
                      ? `${team.city}/${team.state}`
                      : "Localização não informada"}
                  </p>
                </div>
              </Link>
            ))}
          </section>
        )}
      </div>
    </AppShell>
  );
}
