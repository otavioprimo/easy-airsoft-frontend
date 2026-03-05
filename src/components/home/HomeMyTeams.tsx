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
      <div className="bg-white rounded-2xl shadow p-6 space-y-3">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6 space-y-3">
      <h2 className="text-lg font-semibold text-primary">Meus times</h2>
      {teams.length === 0 ? (
        <p className="text-sm text-gray-600">
          Você ainda não participa de nenhum time.
        </p>
      ) : (
        <div className="space-y-2">
          {teams.map((team) => (
            <Link
              key={team.id}
              to={`/app/teams/${team.id}`}
              className="block rounded-lg border border-gray-200 px-4 py-3 hover:border-primary hover:bg-primary/5 transition-colors"
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
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
