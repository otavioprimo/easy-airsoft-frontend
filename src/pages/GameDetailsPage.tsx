import { Fragment, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { HomeGameActions } from "@/components/home/HomeGameActions";
import { HomeGameMeta } from "@/components/home/HomeGameMeta";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getQueryErrorMessage,
  useGameDetailsQuery,
  useUpdateParticipationMutation,
} from "@/hooks/queries/useGamesQueries";

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
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);
  const gameQuery = useGameDetailsQuery(gameId);
  const updateParticipationMutation = useUpdateParticipationMutation();

  const handleUpdateParticipation = (
    nextGameId: string,
    nextStatus: "CONFIRMED" | "INTERESTED" | "CANCELLED",
  ) => {
    updateParticipationMutation.mutate({
      gameId: nextGameId,
      status: nextStatus,
    });
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
          <Link to="/app">
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

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="space-y-4 rounded-3xl border border-primary/20 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-primary">{game.title}</h1>
              <p className="mt-1 text-sm text-gray-600">
                {formatDate.format(new Date(game.datetime))}
              </p>
            </div>

            <Link to="/app">
              <Button variant="outline">Voltar para Home</Button>
            </Link>
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
              currentStatus={game.myParticipationStatus ?? null}
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
            <h2 className="text-lg font-semibold text-primary">Confirmados no jogo</h2>
            <p className="text-sm text-gray-600">
              Jogadores com presença confirmada.
            </p>
          </div>

          {confirmedParticipants.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
              Ainda não há jogadores confirmados.
            </div>
          ) : (
            <div className="space-y-2">
              {confirmedParticipants.map((participant) => {
                const participantName = participant.user?.name || "Jogador";
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

                    <p className="text-sm font-medium text-gray-900">{participantName}</p>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

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
  );
}
