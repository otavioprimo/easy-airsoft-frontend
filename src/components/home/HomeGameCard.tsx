import { HomeGameActions } from "./HomeGameActions";
import { HomeGameMeta } from "./HomeGameMeta";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { GameItem, ParticipationStatus } from "@/types/games";

type HomeGameCardProps = {
  game: GameItem;
  userLocation: { latitude: number; longitude: number } | null;
  isActionLoading: boolean;
  formatDate: Intl.DateTimeFormat;
  onUpdateParticipation: (gameId: string, status: ParticipationStatus) => void;
};

function formatGameDate(dateValue: string, formatter: Intl.DateTimeFormat) {
  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Data não informada";
  }

  return formatter.format(parsedDate);
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function calculateDistanceKm(
  originLatitude: number,
  originLongitude: number,
  targetLatitude: number,
  targetLongitude: number,
) {
  const earthRadiusKm = 6371;
  const latitudeDistance = toRadians(targetLatitude - originLatitude);
  const longitudeDistance = toRadians(targetLongitude - originLongitude);

  const normalizedOriginLatitude = toRadians(originLatitude);
  const normalizedTargetLatitude = toRadians(targetLatitude);

  const a =
    Math.sin(latitudeDistance / 2) * Math.sin(latitudeDistance / 2) +
    Math.sin(longitudeDistance / 2) *
      Math.sin(longitudeDistance / 2) *
      Math.cos(normalizedOriginLatitude) *
      Math.cos(normalizedTargetLatitude);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

export function HomeGameCard({
  game,
  userLocation,
  isActionLoading,
  formatDate,
  onUpdateParticipation,
}: HomeGameCardProps) {
  const city = game.field?.city || game.city;
  const state = game.field?.state || game.state;

  const fieldLatitude = Number(game.field?.latitude);
  const fieldLongitude = Number(game.field?.longitude);
  const hasFieldCoordinates =
    Number.isFinite(fieldLatitude) && Number.isFinite(fieldLongitude);

  const distanceKm =
    userLocation && hasFieldCoordinates
      ? calculateDistanceKm(
          userLocation.latitude,
          userLocation.longitude,
          fieldLatitude,
          fieldLongitude,
        )
      : null;

  return (
    <div className="space-y-4 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-primary">{game.title}</h2>
          <p className="text-sm text-gray-600">
            {formatGameDate(game.datetime, formatDate)}
          </p>
          {game.description && (
            <p className="text-sm text-gray-700 mt-2">{game.description}</p>
          )}
        </div>

        <Button asChild size="sm" variant="outline" className="shrink-0">
          <Link to={`/app/games/${game.id}`}>Ver detalhes</Link>
        </Button>
      </div>

      <HomeGameMeta
        teamName={game.team?.name}
        fieldName={game.field?.name}
        city={city}
        state={state}
        distanceKm={distanceKm}
        price={game.price}
        confirmedCount={game.confirmedCount}
        interestedCount={game.interestedCount}
        maxPlayers={game.maxPlayers}
      />

      <HomeGameActions
        gameId={game.id}
        currentStatus={game.myParticipationStatus ?? null}
        isActionLoading={isActionLoading}
        onUpdateParticipation={onUpdateParticipation}
      />
    </div>
  );
}
