import { Fragment, useMemo, useState } from "react";
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
import { Label } from "@/components/ui/label";

const formatDate = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "full",
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
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);
  const [isAuthPromptOpen, setIsAuthPromptOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const gameQuery = useGameDetailsQuery(gameId);
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

    try {
      await createGameReviewMutation.mutateAsync({
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
      });
      setReviewSuccess(true);
      setReviewRating(0);
      setReviewComment("");
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
  const city = game.field?.city || game.city;
  const state = game.field?.state || game.state;
  const fieldPhotos = game.field?.photos ?? [];
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

            {reviewSuccess ? (
              <div className="rounded-xl border border-green-300 bg-green-50 p-4 text-sm text-green-800">
                Obrigado pela avaliação!
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsReviewDialogOpen(true);
                }}
              >
                Avaliar jogo
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
            <DialogTitle>Avaliar jogo</DialogTitle>
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
