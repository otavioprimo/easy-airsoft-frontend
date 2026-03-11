import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { StarRating } from "@/components/ui/star-rating";
import { UserLink } from "@/components/ui/UserLink";
import { useAuth } from "@/hooks/useAuth";
import { useTeamFieldsQuery } from "@/hooks/queries/useFieldsQueries";
import { useTeamGamesQuery } from "@/hooks/queries/useGamesQueries";
import {
  useFollowingTeamsQuery,
  useTeamMembersQuery,
  useTeamQuery,
} from "@/hooks/queries/useTeamsQueries";
import {
  useFollowTeamMutation,
  useUnfollowTeamMutation,
} from "@/hooks/queries/useTeamsMutations";
import { useCreateFieldReviewMutation } from "@/hooks/queries/useReviewsMutations";
import type { TeamRole } from "@/types/teams";

export default function TeamOverviewPage() {
  const { teamId = "" } = useParams();
  const { user } = useAuth();

  const [reviewingFieldId, setReviewingFieldId] = useState<string | null>(null);
  const [fieldReviewRating, setFieldReviewRating] = useState(0);
  const [fieldReviewComment, setFieldReviewComment] = useState("");
  const [reviewedFieldIds, setReviewedFieldIds] = useState<Set<string>>(new Set());

  const teamQuery = useTeamQuery(teamId);
  const membersQuery = useTeamMembersQuery(teamId);
  const fieldsQuery = useTeamFieldsQuery(teamId);
  const gamesQuery = useTeamGamesQuery(teamId);
  const followingTeamsQuery = useFollowingTeamsQuery();
  const followTeamMutation = useFollowTeamMutation(teamId);
  const unfollowTeamMutation = useUnfollowTeamMutation(teamId);
  const createFieldReviewMutation = useCreateFieldReviewMutation(reviewingFieldId ?? "");

  const formatDate = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });

  const currentUserMembership = (membersQuery.data ?? []).find((member) => {
    return member.userId === user?.id;
  });

  const fallbackLink = user ? "/app" : "/login";

  const currentUserRole = currentUserMembership?.role as TeamRole | undefined;
  const canManageTeam = currentUserRole === "OWNER" || currentUserRole === "ADMIN";
  const isFollowing = (followingTeamsQuery.data ?? []).some(
    (following) => following.teamId === teamId,
  );
  const isFollowActionPending =
    followTeamMutation.isPending || unfollowTeamMutation.isPending;

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
          <Link to={fallbackLink}>
            <Button variant="outline">Voltar para Home</Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  const team = teamQuery.data;
  const fields = fieldsQuery.data ?? [];
  const games = gamesQuery.data ?? [];

  const locationLabel =
    team.city && team.state ? `${team.city}/${team.state}` : "";
  const metaDescription =
    team.description?.slice(0, 150) ||
    [
      `Time de airsoft ${team.name}`,
      locationLabel,
      team.followersCount ? `${team.followersCount} seguidor(es)` : "",
    ]
      .filter(Boolean)
      .join(" — ");

  return (
    <>
      <Helmet>
        <title>{`${team.name} – Easy Airsoft`}</title>
        <meta name="description" content={metaDescription} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={window.location.href} />
        <meta property="og:type" content="profile" />
        <meta property="og:title" content={`${team.name} – Easy Airsoft`} />
        <meta property="og:description" content={metaDescription} />
        {team.logoUrl && <meta property="og:image" content={team.logoUrl} />}
        <meta property="og:url" content={window.location.href} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={`${team.name} – Easy Airsoft`} />
        <meta name="twitter:description" content={metaDescription} />
        {team.logoUrl && <meta name="twitter:image" content={team.logoUrl} />}
      </Helmet>
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
              {user ? (
                <Button
                  variant={isFollowing ? "outline" : "default"}
                  disabled={isFollowActionPending}
                  onClick={() => {
                    if (isFollowing) {
                      unfollowTeamMutation.mutate();
                      return;
                    }

                    followTeamMutation.mutate();
                  }}
                >
                  {isFollowActionPending
                    ? "Salvando..."
                    : isFollowing
                      ? "Deixar de seguir"
                      : "Seguir time"}
                </Button>
              ) : (
                <Link to="/login">
                  <Button variant="outline">Entrar para seguir</Button>
                </Link>
              )}

              {canManageTeam && (
                <Link to={`/app/games/new?teamId=${team.id}`}>
                  <Button variant="outline">Criar jogo</Button>
                </Link>
              )}
              {canManageTeam && (
                <Link to={`/app/teams/${team.id}/edit`}>
                  <Button>Editar time</Button>
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
            <h2 className="text-lg font-semibold text-primary">Membros</h2>
            <span className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-600">
              {membersQuery.isLoading ? "..." : (membersQuery.data ?? []).length} membro(s)
            </span>
          </div>

          {membersQuery.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : (membersQuery.data ?? []).length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
              Nenhum membro encontrado.
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {(membersQuery.data ?? []).map((member) => {
                const memberName = member.user?.name || "Usuário";
                const isOwner = member.role === "OWNER";
                const isAdmin = member.role === "ADMIN";
                const roleLabel = isOwner ? "Dono" : isAdmin ? "Admin" : "Membro";
                const roleBadgeClass = isOwner
                  ? "bg-primary/10 text-primary border-primary/20"
                  : isAdmin
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-gray-50 text-gray-600 border-gray-200";

                return (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3"
                  >
                    {member.user?.profilePhoto ? (
                      <img
                        src={member.user.profilePhoto}
                        alt={memberName}
                        className="h-10 w-10 shrink-0 rounded-full border border-gray-200 object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-sm font-semibold text-primary">
                        {memberName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <UserLink username={member.user?.username}>
                        {memberName}
                      </UserLink>
                      {member.user?.city && member.user?.state && (
                        <p className="truncate text-xs text-gray-500">
                          {member.user.city}/{member.user.state}
                        </p>
                      )}
                    </div>
                    <span className={`shrink-0 rounded-lg border px-2 py-0.5 text-xs font-medium ${roleBadgeClass}`}>
                      {roleLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="space-y-3 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary">Jogos do time</h2>
            <span className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-600">
              {gamesQuery.isLoading ? "..." : games.length} jogo(s)
            </span>
          </div>

          {gamesQuery.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : games.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
              Este time ainda não possui jogos cadastrados.
            </div>
          ) : (
            <div className="grid gap-3">
              {games.map((game) => (
                <div
                  key={game.id}
                  className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-900">{game.title}</p>
                    <p className="text-sm text-gray-600">
                      {formatDate.format(new Date(game.datetime))}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link to={`/games/${game.id}`}>
                      <Button variant="outline" size="sm">Detalhes</Button>
                    </Link>
                    {canManageTeam && (
                      <Link to={`/app/games/${game.id}/edit`}>
                        <Button variant="outline" size="sm">Editar</Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
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

                    {user && !reviewedFieldIds.has(field.id) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setReviewingFieldId(field.id);
                          setFieldReviewRating(0);
                          setFieldReviewComment("");
                        }}
                      >
                        Avaliar
                      </Button>
                    )}

                    {reviewedFieldIds.has(field.id) && (
                      <span className="rounded-md border border-green-300 bg-green-50 px-2 py-1 text-xs text-green-700">
                        Avaliado ✓
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

    <Dialog
      open={Boolean(reviewingFieldId)}
      onOpenChange={(open) => {
        if (!open) {
          setReviewingFieldId(null);
          setFieldReviewRating(0);
          setFieldReviewComment("");
        }
      }}
    >
      <DialogContent className="border border-gray-200 bg-white shadow-xl">
        <DialogHeader>
          <DialogTitle>Avaliar campo</DialogTitle>
          <DialogDescription>
            Dê uma nota para este campo e deixe um comentário opcional.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Nota</Label>
            <StarRating value={fieldReviewRating} onChange={setFieldReviewRating} size="lg" />
            {fieldReviewRating === 0 && (
              <p className="text-xs text-gray-500">Selecione uma nota de 1 a 5 estrelas</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="field-review-comment">Comentário (opcional)</Label>
            <textarea
              id="field-review-comment"
              rows={3}
              value={fieldReviewComment}
              onChange={(e) => {
                setFieldReviewComment(e.target.value);
              }}
              className="flex w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
              placeholder="Compartilhe sua experiência com este campo..."
              maxLength={500}
            />
          </div>

          {createFieldReviewMutation.isError && (
            <p className="text-sm text-red-600">
              Não foi possível enviar a avaliação. Tente novamente.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setReviewingFieldId(null);
              setFieldReviewRating(0);
              setFieldReviewComment("");
            }}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={fieldReviewRating === 0 || createFieldReviewMutation.isPending}
            onClick={async () => {
              if (!reviewingFieldId || fieldReviewRating === 0) return;

              try {
                await createFieldReviewMutation.mutateAsync({
                  rating: fieldReviewRating,
                  comment: fieldReviewComment.trim() || undefined,
                });
                setReviewedFieldIds((prev) => new Set([...prev, reviewingFieldId]));
                setReviewingFieldId(null);
                setFieldReviewRating(0);
                setFieldReviewComment("");
              } catch {
                // error handled above
              }
            }}
          >
            {createFieldReviewMutation.isPending ? "Enviando..." : "Enviar avaliação"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
