import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HomeFilter,
  HomeGameList,
  HomeHeader,
  HomeJoinTeamCard,
  HomeMyTeams,
} from "@/components/home";
import { AppShell } from "@/components/layout/AppShell";
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
import { useJoinTeamByCodeMutation } from "@/hooks/queries/useTeamsMutations";
import { useMyTeamsQuery } from "@/hooks/queries/useTeamsQueries";
import {
  clearPendingTeamInviteCode,
  getPendingTeamInviteCode,
} from "@/lib/team-invite";
import type { ParticipationStatus } from "@/types/games";

export default function HomePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationErrorMessage, setLocationErrorMessage] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [joinErrorMessage, setJoinErrorMessage] = useState("");
  const [joinSuccessMessage, setJoinSuccessMessage] = useState("");
  const [hasTriedAutoJoin, setHasTriedAutoJoin] = useState(false);
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

  const gamesQuery = useGamesQuery(appliedFilters, userLocation);
  const statesQuery = useIbgeStatesQuery();
  const citiesQuery = useIbgeCitiesByStateQuery(filters.state);
  const myTeamsQuery = useMyTeamsQuery();
  const joinTeamByCodeMutation = useJoinTeamByCodeMutation();
  const updateParticipationMutation = useUpdateParticipationMutation();

  const pendingInviteCode = getPendingTeamInviteCode();

  const isLoading = gamesQuery.isLoading;
  const games = ensureGameList(gamesQuery.data);

  const handleUpdateParticipation = (
    gameId: string,
    status: ParticipationStatus,
  ) => {
    updateParticipationMutation.mutate({ gameId, status });
  };

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationErrorMessage(
        "Seu navegador não suporta geolocalização. Mostrando jogos sem filtro de distância.",
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationErrorMessage("");
      },
      (error) => {
        let message =
          "Não foi possível obter sua localização. Mostrando jogos sem filtro de distância.";

        if (error.code === error.PERMISSION_DENIED) {
          message =
            "Permissão de localização negada. Ative para filtrar jogos por distância.";
        }

        setLocationErrorMessage(message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      },
    );
  }, []);

  const handleJoinTeam = () => {
    const normalizedInviteCode = inviteCode.trim().toUpperCase();

    if (!normalizedInviteCode) {
      setJoinErrorMessage("Informe um código de convite válido.");
      setJoinSuccessMessage("");
      return;
    }

    handleJoinTeamByCode(normalizedInviteCode, { clearPendingOnSuccess: false });
  };

  const handleJoinTeamByCode = (
    normalizedInviteCode: string,
    options?: { clearPendingOnSuccess?: boolean },
  ) => {
    setJoinErrorMessage("");
    setJoinSuccessMessage("");

    joinTeamByCodeMutation.mutate(
      { inviteCode: normalizedInviteCode },
      {
        onSuccess: (data) => {
          setJoinSuccessMessage(`Você entrou no time ${data.teamName}.`);
          setInviteCode("");
          if (options?.clearPendingOnSuccess) {
            clearPendingTeamInviteCode();
          }
          void myTeamsQuery.refetch();
        },
        onError: (error) => {
          const message = getQueryErrorMessage(
            error,
            "Não foi possível entrar no time.",
          );

          setJoinErrorMessage(message);

          const normalizedMessage = message.toLowerCase();
          const isDefinitiveInviteError =
            normalizedMessage.includes("já participa deste time") ||
            normalizedMessage.includes("código de convite inválido") ||
            normalizedMessage.includes("código inválido") ||
            normalizedMessage.includes("expirado");

          if (options?.clearPendingOnSuccess && isDefinitiveInviteError) {
            clearPendingTeamInviteCode();
          }
        },
      },
    );
  };

  useEffect(() => {
    if (!pendingInviteCode || hasTriedAutoJoin || joinTeamByCodeMutation.isPending) {
      return;
    }

    setHasTriedAutoJoin(true);
    handleJoinTeamByCode(pendingInviteCode, { clearPendingOnSuccess: true });
  }, [hasTriedAutoJoin, joinTeamByCodeMutation.isPending, pendingInviteCode]);

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
    <AppShell>
      <div className="space-y-6">
        <HomeHeader
          userName={user?.name}
          userPhoto={user?.profilePhoto}
          totalGames={games.length}
          isLoadingGames={isLoading}
          onOpenProfile={() => {
            navigate("/app/profile");
          }}
          onCreateGame={() => {
            navigate("/app/games/new");
          }}
          onCreateTeam={() => {
            navigate("/app/teams/new");
          }}
          onLogout={logout}
        />

        {user && !user.emailVerified && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50/80 px-4 py-3 text-amber-900">
            Seu email ainda não foi confirmado. Verifique sua caixa de entrada
            para ativar a conta.
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-5">
            <HomeFilter
              filters={filters}
              states={statesQuery.data ?? []}
              cities={citiesQuery.data ?? []}
              isLoadingStates={statesQuery.isLoading}
              isLoadingCities={citiesQuery.isLoading}
              isSubmitting={isLoading}
              onApply={() => {
                applyFilters();
              }}
              onClear={() => {
                clearFilters();
              }}
              onChange={setFilters}
            />

            {locationErrorMessage && (
              <div className="rounded-2xl border border-amber-300 bg-amber-50/80 px-4 py-3 text-amber-900">
                {locationErrorMessage}
              </div>
            )}

            {errorMessage && (
              <div className="rounded-2xl border border-red-300 bg-red-50/80 px-4 py-3 text-red-800">
                {errorMessage}
              </div>
            )}

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Jogos disponíveis</h2>
                <span className="rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm text-gray-600">
                  {isLoading ? "..." : games.length} resultado(s)
                </span>
              </div>

              <HomeGameList
                games={games}
                isLoading={isLoading}
                updateParticipationMutation={updateParticipationMutation}
                onUpdateParticipation={handleUpdateParticipation}
                formatDate={formatDate}
              />
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <HomeMyTeams
              teams={myTeamsQuery.data ?? []}
              isLoading={myTeamsQuery.isLoading}
            />

            <HomeJoinTeamCard
              inviteCode={inviteCode}
              isSubmitting={joinTeamByCodeMutation.isPending}
              errorMessage={joinErrorMessage}
              successMessage={joinSuccessMessage}
              onInviteCodeChange={setInviteCode}
              onSubmit={handleJoinTeam}
            />
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
