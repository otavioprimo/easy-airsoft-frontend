import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  HomeFilter,
  HomeGameList,
  HomeHeader,
  HomeMyTeams,
} from "@/components/home";
import { useAuth } from "@/hooks/useAuth";
import { useLocationDateFilters } from "@/hooks/useLocationDateFilters";
import {
  ensureGameList,
  getQueryErrorMessage,
  useGamesQuery,
  useUpdateParticipationMutation,
} from "@/hooks/queries/useGamesQueries";
import {
  useIbgeCitiesByStateQuery,
  useIbgeStatesQuery,
} from "@/hooks/queries/useIbgeQueries";
import { useMyTeamsQuery } from "@/hooks/queries/useTeamsQueries";
import type { ParticipationStatus } from "@/types/games";

export default function HomePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { filters, setFilters, appliedFilters, applyFilters, clearFilters } =
    useLocationDateFilters();

  const formatDate = useMemo(
    () =>
      new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      }),
    [],
  );

  const gamesQuery = useGamesQuery(appliedFilters);
  const statesQuery = useIbgeStatesQuery();
  const citiesQuery = useIbgeCitiesByStateQuery(filters.state);
  const myTeamsQuery = useMyTeamsQuery();
  const updateParticipationMutation = useUpdateParticipationMutation();

  const isLoading = gamesQuery.isLoading;
  const isRefreshing = gamesQuery.isRefetching;
  const games = ensureGameList(gamesQuery.data);

  const handleUpdateParticipation = (
    gameId: string,
    status: ParticipationStatus,
  ) => {
    updateParticipationMutation.mutate({ gameId, status });
  };

  const errorMessage =
    (gamesQuery.error &&
      getQueryErrorMessage(
        gamesQuery.error,
        "Não foi possível carregar os jogos.",
      )) ||
    (updateParticipationMutation.error &&
      getQueryErrorMessage(
        updateParticipationMutation.error,
        "Não foi possível atualizar sua participação.",
      )) ||
    "";

  return (
    <div className="min-h-screen bg-neutral-light p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <HomeHeader
          userName={user?.name}
          isRefreshing={isRefreshing}
          isLoading={isLoading}
          onCreateTeam={() => {
            navigate("/app/teams/new");
          }}
          onRefresh={() => {
            gamesQuery.refetch();
          }}
          onLogout={logout}
        />

        {user && !user.emailVerified && (
          <div className="bg-amber-50 border-2 border-amber-200 text-amber-900 rounded-xl p-4">
            Seu email ainda não foi confirmado. Verifique sua caixa de entrada
            para ativar a conta.
          </div>
        )}

        <HomeFilter
          filters={filters}
          states={statesQuery.data ?? []}
          cities={citiesQuery.data ?? []}
          isLoadingStates={statesQuery.isLoading}
          isLoadingCities={citiesQuery.isLoading}
          isSubmitting={isRefreshing || isLoading}
          onApply={() => {
            applyFilters();
          }}
          onClear={() => {
            clearFilters();
          }}
          onChange={setFilters}
        />

        <HomeMyTeams
          teams={myTeamsQuery.data ?? []}
          isLoading={myTeamsQuery.isLoading}
        />

        {errorMessage && (
          <div className="bg-red-50 border-2 border-red-200 text-red-800 rounded-xl p-4">
            {errorMessage}
          </div>
        )}

        <HomeGameList
          games={games}
          isLoading={isLoading}
          updateParticipationMutation={updateParticipationMutation}
          onUpdateParticipation={handleUpdateParticipation}
          formatDate={formatDate}
        />
      </div>
    </div>
  );
}
