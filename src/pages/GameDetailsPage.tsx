import { Fragment, useMemo, useState } from "react";
import { Star } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate, useParams } from "react-router-dom";
import { HomeGameActions } from "@/components/home/HomeGameActions";
import { HomeGameMeta } from "@/components/home/HomeGameMeta";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { UserLink } from "@/components/ui/UserLink";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import {
  getQueryErrorMessage,
  useGameDetailsQuery,
  useUpdateParticipationMutation,
} from "@/hooks/queries/useGamesQueries";
import { useMyTeamsQuery } from "@/hooks/queries/useTeamsQueries";
import { useCreateGameReviewMutation } from "@/hooks/queries/useReviewsMutations";
import { useFieldQuery } from "@/hooks/queries/useFieldsQueries";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const formatDate = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "full",
  timeStyle: "short",
});

const formatReviewDate = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

const urlPattern = /(https?:\/\/[^\s]+)/g;
const strictUrlPattern = /^https?:\/\/[^\s]+$/;

function renderDescriptionWithLinks(text: string) {
  const lines = text.split("\n");

  return lines.map((line, lineIndex) => {
    const segments = line.split(urlPattern);

    return (
      <Fragment key={`description-line-${lineIndex}`}>
        {segments.map((segment, segmentIndex) => {
          if (!segment) {
            return null;
          }

          if (strictUrlPattern.test(segment)) {
            return (
              <a
                key={`description-link-${lineIndex}-${segmentIndex}`}
                href={segment}
                target="_blank"
                rel="noreferrer noopener"
                className="font-medium text-primary underline underline-offset-2 break-all"
              >
                {segment}
              </a>
            );
          }

          return (
            <span key={`description-text-${lineIndex}-${segmentIndex}`}>
              {segment}
            </span>
          );
        })}
        {lineIndex < lines.length - 1 && <br />}
      </Fragment>
    );
  });
}

export default function GameDetailsPage() {
  const { gameId = "" } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);
  const [isFieldReviewsDialogOpen, setIsFieldReviewsDialogOpen] = useState(false);
  const [isAuthPromptOpen, setIsAuthPromptOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");

  const gameQuery = useGameDetailsQuery(gameId);
  const fieldId = gameQuery.data?.field?.id ?? "";
  const fieldDetailsQuery = useFieldQuery(fieldId);
  const updateParticipationMutation = useUpdateParticipationMutation();
  const myTeamsQuery = useMyTeamsQuery();
  const createGameReviewMutation = useCreateGameReviewMutation(gameId);
  const fallbackLink = isAuthenticated ? "/app" : "/login";

  const manageableTeamIds = useMemo(() => {
    return (myTeamsQuery.data ?? [])
      .filter((team) => team.currentUserRole === "OWNER" || team.currentUserRole === "ADMIN")
      .map((team) => team.id);
  }, [myTeamsQuery.data]);

  const canEditGame = Boolean(
    isAuthenticated &&
    gameQuery.data?.team?.id &&
    manageableTeamIds.includes(gameQuery.data.team.id),
  );

  const isConfirmedParticipant =
    isAuthenticated &&
    gameQuery.data?.myParticipationStatus === "CONFIRMED";

  const handleUpdateParticipation = (
    nextGameId: string,
    nextStatus: "CONFIRMED" | "INTERESTED" | "CANCELLED",
  ) => {
    if (!isAuthenticated) {
      setIsAuthPromptOpen(true);
      return;
    }

    updateParticipationMutation.mutate({
      gameId: nextGameId,
      status: nextStatus,
    });
  };

  const handleSubmitReview = async () => {
    if (reviewRating === 0) return;

    if (!gameQuery.data || new Date(gameQuery.data.datetime) > new Date()) {
      toast({
        title: "Avaliação indisponível",
        description: "Você só pode avaliar após a data do jogo.",
      });
      return;
    }

    try {
      await createGameReviewMutation.mutateAsync({
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
      });
      setIsReviewDialogOpen(false);
      setReviewRating(0);
      setReviewComment("");
      toast({
        title: "Avaliação enviada",
        description: "Obrigado por avaliar este jogo.",
      });
    } catch {
      // error handled below
    }
  };

  if (gameQuery.isLoading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-4xl space-y-6">
          <section className="space-y-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="w-full space-y-2">
                <Skeleton className="h-8 w-3/5" />
                <Skeleton className="h-4 w-2/5" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>

            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />

            <div className="grid gap-2 md:grid-cols-2">
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>

            <div className="flex gap-2">
              <Skeleton className="h-9 w-40" />
              <Skeleton className="h-9 w-32" />
            </div>
          </section>

          <section className="space-y-3 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <Skeleton className="h-6 w-52" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Skeleton className="aspect-[4/3] w-full" />
              <Skeleton className="aspect-[4/3] w-full" />
              <Skeleton className="aspect-[4/3] w-full" />
            </div>
          </section>

          <section className="space-y-3 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <Skeleton className="h-6 w-44" />
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </section>
        </div>
      </AppShell>
    );
  }

  if (gameQuery.isError || !gameQuery.data) {
    const errorMessage = gameQuery.error
      ? getQueryErrorMessage(gameQuery.error, "Não foi possível carregar o jogo.")
      : "Não foi possível carregar o jogo.";

    return (
      <AppShell>
        <div className="mx-auto max-w-4xl space-y-4 rounded-3xl border border-red-300 bg-red-50 p-6 text-red-800">
          <p>{errorMessage}</p>
          <Link to={fallbackLink}>
            <Button variant="outline">Voltar para Home</Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  const game = gameQuery.data;
  const myReview = game.myReview;
  const hasGameHappened = new Date(game.datetime) <= new Date();
  const canReviewGame = isConfirmedParticipant && hasGameHappened;
  const city = game.field?.city || game.city;
  const state = game.field?.state || game.state;
  const fieldPhotos = game.field?.photos ?? [];
  const fieldReviews = fieldDetailsQuery.data?.reviews ?? [];
  const fieldRating = fieldDetailsQuery.data?.rating ?? { avg: 0, count: 0 };
  const confirmedParticipants = game.participants ?? [];
  const isActionLoading =
    updateParticipationMutation.isPending &&
    updateParticipationMutation.variables?.gameId === game.id;
  const participationErrorMessage =
    updateParticipationMutation.error &&
    getQueryErrorMessage(
      updateParticipationMutation.error,
      "Não foi possível atualizar sua participação.",
    );

  const ogImage = fieldPhotos[0]?.photoUrl;
  const locationLabel =
    city && state ? `${city}/${state}` : city || state || "";
  const teamLabel = game.team?.name ? ` • ${game.team.name}` : "";
  const gameDate = formatDate.format(new Date(game.datetime));
  const metaDescription =
    [
      game.description?.slice(0, 120) ||
        `Jogo de airsoft em ${locationLabel || "local a definir"}`,
      gameDate,
      locationLabel,
    ]
      .filter(Boolean)
      .join(" — ") + teamLabel;

  const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = fieldReviews.filter((review) => review.rating === stars).length;
    const percentage = fieldRating.count > 0
      ? Math.round((count / fieldRating.count) * 100)
      : 0;

    return {
      stars,
      count,
      percentage,
    };
  });

  return (
    <>
      <Helmet>
        <title>{`${game.title} – Easy Airsoft`}</title>
        <meta name="description" content={metaDescription} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={window.location.href} />
        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={`${game.title} – Easy Airsoft`} />
        <meta property="og:description" content={metaDescription} />
        {ogImage && <meta property="og:image" content={ogImage} />}
        <meta property="og:url" content={window.location.href} />
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${game.title} – Easy Airsoft`} />
        <meta name="twitter:description" content={metaDescription} />
        {ogImage && <meta name="twitter:image" content={ogImage} />}
      </Helmet>
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="space-y-4 rounded-3xl border border-primary/20 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-primary">{game.title}</h1>
              <p className="mt-1 text-sm text-gray-600">
                {formatDate.format(new Date(game.datetime))}
              </p>
              {game.status && game.status !== "ACTIVE" && (
                <span
                  className={
                    game.status === "CANCELLED"
                      ? "mt-1 inline-block rounded-full border border-red-300 bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700"
                      : "mt-1 inline-block rounded-full border border-gray-300 bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700"
                  }
                >
                  {game.status === "CANCELLED" ? "Cancelado" : "Encerrado"}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {canEditGame && (
                <Link to={`/app/games/${game.id}/edit`}>
                  <Button variant="outline" size="sm">
                    Editar jogo
                  </Button>
                </Link>
              )}
              <Link to={fallbackLink}>
                <Button variant="outline">Voltar para Home</Button>
              </Link>
            </div>
          </div>

          {game.description && (
            <p className="text-sm text-gray-700">
              {renderDescriptionWithLinks(game.description)}
            </p>
          )}

          {game.externalTicketUrl && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
              <p className="text-sm text-gray-700">Compra de ingresso:</p>
              <a
                href={game.externalTicketUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-1 inline-flex text-sm font-semibold text-primary underline underline-offset-2 break-all"
              >
                Abrir link de ingresso
              </a>
            </div>
          )}

          <HomeGameMeta
            teamName={game.team?.name}
            teamId={game.team?.id}
            fieldName={game.field?.name}
            city={city}
            state={state}
            price={game.price}
            confirmedCount={game.confirmedCount}
            interestedCount={game.interestedCount}
            maxPlayers={game.maxPlayers}
          />

          <div className="pt-1">
            <HomeGameActions
              gameId={game.id}
              currentStatus={isAuthenticated ? (game.myParticipationStatus ?? null) : null}
              isActionLoading={isActionLoading}
              onUpdateParticipation={handleUpdateParticipation}
            />
          </div>

          {participationErrorMessage && (
            <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
              {participationErrorMessage}
            </div>
          )}
        </section>

        <section className="space-y-3 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-primary">Fotos do campo</h2>
            <p className="text-sm text-gray-600">
              Toque em uma foto para ampliar.
            </p>
          </div>

          {fieldPhotos.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
              Este campo ainda não possui fotos cadastradas.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {fieldPhotos.map((photo) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => {
                    setSelectedPhotoUrl(photo.photoUrl);
                  }}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
                >
                  <img
                    src={photo.photoUrl}
                    alt={`Foto do campo ${game.field?.name ?? ""}`}
                    className="aspect-[4/3] h-full w-full object-cover transition-transform hover:scale-105"
                  />
                </button>
              ))}
            </div>
          )}

          <div className="rounded-xl border border-red-100 bg-red-50/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-red-500">Resumo das avaliações</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-900">{fieldRating.avg.toFixed(1)}</span>
                  <StarRating value={Math.round(fieldRating.avg)} readonly size="sm" />
                </div>
                <p className="text-xs text-gray-600">
                  {fieldRating.count.toLocaleString("pt-BR")} avaliação(ões)
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsFieldReviewsDialogOpen(true);
                }}
                disabled={!game.field?.id}
              >
                Ver avaliações
              </Button>
            </div>
          </div>
        </section>

        <section className="space-y-3 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-primary">Jogadores Confirmados no jogo</h2>
            <p className="text-sm text-gray-600">
              Jogadores com presença confirmada.
            </p>
          </div>

          {!isAuthenticated ? (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-gray-700">
              <p>
                Para ver os jogadores confirmados no jogo, você precisa entrar ou se cadastrar.
              </p>
              <div className="mt-3">
                <Button
                  type="button"
                  onClick={() => {
                    navigate("/login");
                  }}
                >
                  Entrar ou cadastrar
                </Button>
              </div>
            </div>
          ) : confirmedParticipants.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
              Ainda não há jogadores confirmados.
            </div>
          ) : (
            <div className="space-y-2">
              {confirmedParticipants.map((participant) => {
                const participantName = participant.user?.name || "Jogador";
                const participantUsername = participant.user?.username;
                const participantPhoto = participant.user?.profilePhoto;

                return (
                  <div
                    key={participant.id}
                    className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3"
                  >
                    {participantPhoto ? (
                      <img
                        src={participantPhoto}
                        alt={`Foto de ${participantName}`}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-sm font-semibold text-primary">
                        {participantName.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <UserLink username={participantUsername} className="text-sm">
                      {participantName}
                    </UserLink>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {isConfirmedParticipant && (
          <section className="space-y-3 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-lg font-semibold text-primary">Avaliação do jogo</h2>
              <p className="text-sm text-gray-600">
                Você participou deste jogo. Deixe sua avaliação!
              </p>
            </div>

            {!hasGameHappened && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-primary">
                A avaliação será liberada após a data do jogo.
              </div>
            )}

            {myReview && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                <p className="font-medium">Sua avaliação atual: {myReview.rating ?? 0}/5</p>
                {myReview.comment && <p className="mt-1">{myReview.comment}</p>}
              </div>
            )}

            {canReviewGame && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setReviewRating(myReview?.rating ?? 0);
                  setReviewComment(myReview?.comment ?? "");
                  setIsReviewDialogOpen(true);
                }}
              >
                {myReview ? "Editar avaliação" : "Avaliar jogo"}
              </Button>
            )}
          </section>
        )}
      </div>

      <Dialog open={isAuthPromptOpen} onOpenChange={setIsAuthPromptOpen}>
        <DialogContent className="border border-gray-200 bg-white shadow-xl">
          <DialogHeader>
            <DialogTitle>Entre para continuar</DialogTitle>
            <DialogDescription>
              Para confirmar presença, demonstrar interesse ou interagir neste jogo, você precisa entrar ou criar sua conta.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAuthPromptOpen(false);
              }}
            >
              Agora não
            </Button>
            <Button
              type="button"
              onClick={() => {
                setIsAuthPromptOpen(false);
                navigate("/login");
              }}
            >
              Entrar ou cadastrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isReviewDialogOpen}
        onOpenChange={(open) => {
          setIsReviewDialogOpen(open);
          if (!open) {
            setReviewRating(0);
            setReviewComment("");
          }
        }}
      >
        <DialogContent className="border border-gray-200 bg-white shadow-xl">
          <DialogHeader>
            <DialogTitle>{myReview ? "Editar avaliação" : "Avaliar jogo"}</DialogTitle>
            <DialogDescription>
              Dê uma nota para este jogo e deixe um comentário opcional.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nota</Label>
              <StarRating value={reviewRating} onChange={setReviewRating} size="lg" />
              {reviewRating === 0 && (
                <p className="text-xs text-gray-500">Selecione uma nota de 1 a 5 estrelas</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="review-comment">Comentário (opcional)</Label>
              <textarea
                id="review-comment"
                rows={3}
                value={reviewComment}
                onChange={(e) => {
                  setReviewComment(e.target.value);
                }}
                className="flex w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                placeholder="Compartilhe sua experiência..."
                maxLength={500}
              />
            </div>

            {createGameReviewMutation.isError && (
              <p className="text-sm text-red-600">
                {getQueryErrorMessage(
                  createGameReviewMutation.error,
                  "Não foi possível enviar a avaliação.",
                )}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsReviewDialogOpen(false);
                setReviewRating(0);
                setReviewComment("");
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={reviewRating === 0 || createGameReviewMutation.isPending}
              onClick={handleSubmitReview}
            >
              {createGameReviewMutation.isPending ? "Enviando..." : "Enviar avaliação"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isFieldReviewsDialogOpen} onOpenChange={setIsFieldReviewsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border border-gray-200 bg-white shadow-xl">
          <DialogHeader>
            <DialogTitle>Avaliações do campo</DialogTitle>
            <DialogDescription>
              {game.field?.name
                ? `${game.field.name} • ${city ?? ""}${city && state ? "/" : ""}${state ?? ""}`
                : "Veja o resumo e todos os comentários deste campo."}
            </DialogDescription>
          </DialogHeader>

          {fieldDetailsQuery.isLoading ? (
            <div className="space-y-3 py-2">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <section className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">Resumo das avaliações</p>

                <div className="mt-3 grid gap-4 sm:grid-cols-[180px_1fr] sm:items-center">
                  <div>
                    <p className="text-4xl font-bold text-gray-900">{fieldRating.avg.toFixed(1)}</p>
                    <div className="mt-1">
                      <StarRating value={Math.round(fieldRating.avg)} readonly size="sm" />
                    </div>
                    <p className="mt-1 text-xs text-gray-600">
                      {fieldRating.count.toLocaleString("pt-BR")} avaliação(ões)
                    </p>
                  </div>

                  <div className="space-y-2">
                    {ratingDistribution.map((entry) => (
                      <div key={entry.stars} className="flex items-center gap-2">
                        <span className="w-4 text-xs font-medium text-gray-700">{entry.stars}</span>
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-primary/15">
                          <div
                            className="h-full rounded-full bg-accent"
                            style={{ width: `${entry.percentage}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-xs text-gray-600">{entry.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="space-y-2">
                <p className="text-sm font-semibold text-gray-900">Todas as avaliações</p>

                {fieldReviews.length === 0 ? (
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                    Este campo ainda não possui avaliações públicas.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {fieldReviews.map((review) => {
                      const reviewerName = review.user?.name || "Jogador";

                      return (
                        <div
                          key={review.id}
                          className="rounded-xl border border-gray-200 bg-white p-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-gray-900">{reviewerName}</p>
                              {review.updatedAt && (
                                <p className="text-xs text-gray-500">
                                  {formatReviewDate.format(new Date(review.updatedAt))}
                                </p>
                              )}
                            </div>

                            <StarRating value={review.rating ?? 0} readonly size="sm" />
                          </div>

                          {review.comment && (
                            <p className="mt-2 text-sm text-gray-700">{review.comment}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {selectedPhotoUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={() => {
            setSelectedPhotoUrl(null);
          }}
        >
          <div
            className="w-full max-w-5xl space-y-3"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                className="bg-white"
                onClick={() => {
                  setSelectedPhotoUrl(null);
                }}
              >
                Fechar
              </Button>
            </div>

            <img
              src={selectedPhotoUrl}
              alt={`Foto ampliada do campo ${game.field?.name ?? ""}`}
              className="max-h-[80vh] w-full rounded-2xl object-contain"
            />
          </div>
        </div>
      )}
    </AppShell>
    </>
  );
}
