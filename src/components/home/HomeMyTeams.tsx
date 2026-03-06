import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import type { Team } from "@/types/teams";

type HomeMyTeamsProps = {
  teams: Team[];
  isLoading: boolean;
};

export function HomeMyTeams({ teams, isLoading }: HomeMyTeamsProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-primary">Meus times</h2>
      {teams.length === 0 ? (
        <p className="text-sm text-gray-600">
          Você ainda não participa de nenhum time.
        </p>
      ) : (
        <div className="space-y-2">
          {teams.map((team) => {
              const canEditTeam = team.canEdit === true;

              return (
            <div
              key={team.id}
              className="rounded-lg border border-gray-200 px-4 py-3 hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                {team.logoUrl ? (
                  <img
                    src={team.logoUrl}
                    alt={`Logo do time ${team.name}`}
                    className="h-10 w-10 rounded-md object-cover border border-gray-200"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-md bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-sm font-bold">
                    {team.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <div>
                  <p className="font-medium text-gray-900">{team.name}</p>
                  <p className="text-sm text-gray-600">
                    {team.city && team.state
                      ? `${team.city}/${team.state}`
                      : "Sem localização"}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  to={`/app/teams/${team.id}`}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:border-primary hover:text-primary"
                >
                  Ver time
                </Link>
                {canEditTeam && (
                  <Link
                    to={`/app/teams/${team.id}/edit`}
                    className="rounded-md border border-primary/30 bg-primary/5 px-3 py-1.5 text-sm text-primary hover:bg-primary/10"
                  >
                    Editar
                  </Link>
                )}
              </div>
            </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
