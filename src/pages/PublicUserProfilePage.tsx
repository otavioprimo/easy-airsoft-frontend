import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  usePublicProfileByUsernameQuery,
  usePublicProfileFollowingTeamsQuery,
  usePublicProfileGamesQuery,
  usePublicProfileTeamsQuery,
} from "@/hooks/queries/useUsersQueries";

type ProfileModalType = "games" | "teams" | "following" | null;

function RoleLabel({ role }: { role: string }) {
  if (role === "OWNER") return <span className="rounded-md border border-primary/20 bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">Dono</span>;
  if (role === "ADMIN") return <span className="rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-xs font-medium text-amber-700">Admin</span>;
  return <span className="rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-xs font-medium text-gray-600">Membro</span>;
}

export default function PublicUserProfilePage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { data: profile, isLoading, isError } = usePublicProfileByUsernameQuery(username);
  const [activeModal, setActiveModal] = useState<ProfileModalType>(null);
  const [modalPage, setModalPage] = useState(1);

  const gamesQuery = usePublicProfileGamesQuery(
    username,
    modalPage,
    activeModal === "games",
  );
  const teamsQuery = usePublicProfileTeamsQuery(
    username,
    modalPage,
    activeModal === "teams",
  );
  const followingTeamsQuery = usePublicProfileFollowingTeamsQuery(
    username,
    modalPage,
    activeModal === "following",
  );

  useEffect(() => {
    if (isError) navigate("/app", { replace: true });
  }, [isError, navigate]);

  const modalConfig = useMemo(() => {
    if (activeModal === "games") {
      return {
        title: "Jogos",
        description: "Jogos já finalizados em que o usuário confirmou presença.",
        query: gamesQuery,
      };
    }

    if (activeModal === "teams") {
      return {
        title: "Times",
        description: "Times dos quais o usuário faz parte.",
        query: teamsQuery,
      };
    }

    if (activeModal === "following") {
      return {
        title: "Times seguindo",
        description: "Times que o usuário acompanha.",
        query: followingTeamsQuery,
      };
    }

    return null;
  }, [activeModal, followingTeamsQuery, gamesQuery, teamsQuery]);

  if (isLoading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-2xl space-y-4">
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col items-center gap-4">
              <Skeleton className="h-28 w-28 rounded-full" />
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <Skeleton className="h-28 w-full rounded-3xl" />
          <Skeleton className="h-40 w-full rounded-3xl" />
        </div>
      </AppShell>
    );
  }

  if (!profile) return null;

  const location = profile.city && profile.state ? `${profile.city}, ${profile.state}` : null;
  const createdAtFormatted = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("pt-BR", { year: "numeric", month: "long" })
    : null;

  const confirmedGamesCount = profile._count?.gameParticipations ?? 0;
  const followingTeamsCount = profile._count?.followingTeams ?? 0;
  const teamsCount = profile.teamMemberships?.length ?? 0;

  const openModal = (modal: Exclude<ProfileModalType, null>) => {
    setModalPage(1);
    setActiveModal(modal);
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-4">
        {/* Cabeçalho com botão voltar */}
        <div>
          <Button variant="ghost" onClick={() => navigate(-1)} className="text-gray-600 hover:text-primary">
            ← Voltar
          </Button>
        </div>

        {/* Card principal */}
        <section className="rounded-3xl border border-primary/10 bg-white p-8 shadow-sm">
          <div className="flex flex-col items-center gap-3 text-center">
            {profile.profilePhoto ? (
              <img
                src={profile.profilePhoto}
                alt={profile.name}
                className="h-28 w-28 rounded-full border-4 border-primary/20 object-cover"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-primary/20 bg-primary/10">
                <span className="text-4xl font-bold text-primary/60">
                  {profile.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            <div>
              <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
              {profile.username && (
                <p className="text-sm text-gray-500">@{profile.username}</p>
              )}
            </div>

            {profile.bio && (
              <p className="max-w-md text-sm text-gray-600">{profile.bio}</p>
            )}

            <div className="flex flex-wrap justify-center gap-4 pt-1 text-sm text-gray-500">
              {location && (
                <span className="flex items-center gap-1">
                  <span>📍</span> {location}
                </span>
              )}
              {createdAtFormatted && (
                <span className="flex items-center gap-1">
                  <span>📅</span> Desde {createdAtFormatted}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Estatísticas */}
        <section className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => openModal("games")}
            className="rounded-2xl border border-gray-200 bg-white p-4 text-center shadow-sm transition-colors hover:border-primary/30 hover:bg-primary/5"
          >
            <p className="text-2xl font-bold text-primary">{confirmedGamesCount}</p>
            <p className="mt-0.5 text-xs text-gray-500">Jogos</p>
          </button>
          <button
            type="button"
            onClick={() => openModal("teams")}
            className="rounded-2xl border border-gray-200 bg-white p-4 text-center shadow-sm transition-colors hover:border-primary/30 hover:bg-primary/5"
          >
            <p className="text-2xl font-bold text-primary">{teamsCount}</p>
            <p className="mt-0.5 text-xs text-gray-500">Times</p>
          </button>
          <button
            type="button"
            onClick={() => openModal("following")}
            className="rounded-2xl border border-gray-200 bg-white p-4 text-center shadow-sm transition-colors hover:border-primary/30 hover:bg-primary/5"
          >
            <p className="text-2xl font-bold text-primary">{followingTeamsCount}</p>
            <p className="mt-0.5 text-xs text-gray-500">Times seguindo</p>
          </button>
        </section>

        {/* Times */}
        {teamsCount > 0 && (
          <section className="space-y-3 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-primary">Times</h2>
            <div className="space-y-2">
              {profile.teamMemberships!.map(({ team, role }) => (
                <Link
                  key={team.id}
                  to={`/teams/${team.id}`}
                  className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 transition-colors hover:border-primary/30 hover:bg-primary/5"
                >
                  {team.logoUrl ? (
                    <img
                      src={team.logoUrl}
                      alt={team.name}
                      className="h-10 w-10 shrink-0 rounded-lg border border-gray-200 object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-sm font-bold text-primary">
                      {team.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-gray-900">{team.name}</p>
                    {team.city && team.state && (
                      <p className="text-xs text-gray-500">{team.city}/{team.state}</p>
                    )}
                  </div>
                  <RoleLabel role={role} />
                </Link>
              ))}
            </div>
          </section>
        )}

        <Dialog open={activeModal !== null} onOpenChange={(open) => !open && setActiveModal(null)}>
          <DialogContent className="max-h-[85vh] max-w-2xl overflow-hidden rounded-3xl border-gray-200 bg-white p-0 shadow-xl">
            <div className="flex max-h-[85vh] flex-col">
              <DialogHeader className="border-b border-gray-200 px-6 py-5">
                <DialogTitle>{modalConfig?.title ?? "Detalhes"}</DialogTitle>
                <DialogDescription>{modalConfig?.description ?? ""}</DialogDescription>
              </DialogHeader>

              <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
                {modalConfig?.query.isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <Skeleton key={`profile-modal-skeleton-${index}`} className="h-20 w-full rounded-2xl" />
                    ))}
                  </div>
                ) : null}

                {!modalConfig?.query.isLoading && activeModal === "games" && (
                  <div className="space-y-3">
                    {(gamesQuery.data?.items ?? []).length === 0 ? (
                      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                        Nenhum jogo encontrado.
                      </div>
                    ) : (
                      gamesQuery.data?.items.map((game) => {
                        const locationLabel = game.field?.city && game.field?.state
                          ? `${game.field.city}/${game.field.state}`
                          : game.city && game.state
                            ? `${game.city}/${game.state}`
                            : "Local não informado";

                        return (
                          <Link
                            key={game.id}
                            to={`/app/games/${game.id}`}
                            className="block rounded-2xl border border-gray-200 bg-white p-4 transition-colors hover:border-primary/30 hover:bg-primary/5"
                          >
                            <p className="font-medium text-gray-900">{game.title}</p>
                            <p className="mt-1 text-sm text-gray-500">
                              {new Date(game.datetime).toLocaleString("pt-BR")}
                            </p>
                            <p className="mt-1 text-sm text-gray-600">{locationLabel}</p>
                            {game.team && (
                              <p className="mt-2 text-xs font-medium text-primary">{game.team.name}</p>
                            )}
                          </Link>
                        );
                      })
                    )}
                  </div>
                )}

                {!modalConfig?.query.isLoading && activeModal === "teams" && (
                  <div className="space-y-3">
                    {(teamsQuery.data?.items ?? []).length === 0 ? (
                      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                        Nenhum time encontrado.
                      </div>
                    ) : (
                      teamsQuery.data?.items.map(({ team, role }) => (
                        <Link
                          key={team.id}
                          to={`/teams/${team.id}`}
                          className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 transition-colors hover:border-primary/30 hover:bg-primary/5"
                        >
                          {team.logoUrl ? (
                            <img
                              src={team.logoUrl}
                              alt={team.name}
                              className="h-12 w-12 rounded-xl border border-gray-200 object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-sm font-bold text-primary">
                              {team.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-gray-900">{team.name}</p>
                            <p className="text-sm text-gray-500">
                              {team.city && team.state ? `${team.city}/${team.state}` : "Local não informado"}
                            </p>
                          </div>
                          <RoleLabel role={role} />
                        </Link>
                      ))
                    )}
                  </div>
                )}

                {!modalConfig?.query.isLoading && activeModal === "following" && (
                  <div className="space-y-3">
                    {(followingTeamsQuery.data?.items ?? []).length === 0 ? (
                      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                        Nenhum time seguido encontrado.
                      </div>
                    ) : (
                      followingTeamsQuery.data?.items.map((team) => (
                        <Link
                          key={team.id}
                          to={`/teams/${team.id}`}
                          className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 transition-colors hover:border-primary/30 hover:bg-primary/5"
                        >
                          {team.logoUrl ? (
                            <img
                              src={team.logoUrl}
                              alt={team.name}
                              className="h-12 w-12 rounded-xl border border-gray-200 object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-sm font-bold text-primary">
                              {team.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-gray-900">{team.name}</p>
                            <p className="text-sm text-gray-500">
                              {team.city && team.state ? `${team.city}/${team.state}` : "Local não informado"}
                            </p>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                )}
              </div>

              {modalConfig?.query.data?.pagination && modalConfig.query.data.pagination.totalPages > 0 && (
                <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
                  <p className="text-sm text-gray-500">
                    Página {modalConfig.query.data.pagination.page} de {modalConfig.query.data.pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={modalPage <= 1 || modalConfig.query.isFetching}
                      onClick={() => setModalPage((currentPage) => Math.max(1, currentPage - 1))}
                    >
                      Anterior
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={
                        modalPage >= modalConfig.query.data.pagination.totalPages ||
                        modalConfig.query.isFetching
                      }
                      onClick={() => setModalPage((currentPage) => currentPage + 1)}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
