import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeamQuery } from "@/hooks/queries/useTeamsQueries";

export default function TeamDetailsPage() {
  const { teamId = "" } = useParams();
  const teamQuery = useTeamQuery(teamId);

  if (teamQuery.isLoading) {
    return (
      <div className="min-h-screen bg-neutral-light p-6">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-6 space-y-4">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (teamQuery.isError || !teamQuery.data) {
    return (
      <div className="min-h-screen bg-neutral-light p-6">
        <div className="max-w-3xl mx-auto bg-red-50 border-2 border-red-200 text-red-800 rounded-xl p-4 space-y-3">
          <p>Não foi possível carregar o time.</p>
          <Link to="/app">
            <Button variant="outline">Voltar para Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const team = teamQuery.data;

  return (
    <div className="min-h-screen bg-neutral-light p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow p-6">
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
              <h1 className="text-2xl font-bold text-primary">{team.name}</h1>
              <p className="text-sm text-gray-600 mt-1">
                {team.city && team.state
                  ? `${team.city}/${team.state}`
                  : "Localização não informada"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 space-y-2">
          <h2 className="text-lg font-semibold text-primary">Sobre o time</h2>
          <p className="text-sm text-gray-700">
            {team.description || "Sem descrição cadastrada."}
          </p>
          <div className="pt-2">
            <Link to="/app">
              <Button variant="outline">Voltar para Home</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
