import { HomeGameActions } from "./HomeGameActions";
import { HomeGameMeta } from "./HomeGameMeta";
import type { GameItem, ParticipationStatus } from "@/types/games";

type HomeGameCardProps = {
  game: GameItem;
  isActionLoading: boolean;
  formatDate: Intl.DateTimeFormat;
  onUpdateParticipation: (gameId: string, status: ParticipationStatus) => void;
};

export function HomeGameCard({
  game,
  isActionLoading,
  formatDate,
  onUpdateParticipation,
}: HomeGameCardProps) {
  const city = game.field?.city || game.city;
  const state = game.field?.state || game.state;

  return (
    <div className="bg-white rounded-2xl shadow p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-primary">{game.title}</h2>
          <p className="text-sm text-gray-600">
            {formatDate.format(new Date(game.datetime))}
          </p>
          {game.description && (
            <p className="text-sm text-gray-700 mt-2">{game.description}</p>
          )}
        </div>
        <span className="text-xs font-semibold bg-gray-100 text-gray-700 px-2 py-1 rounded-md">
          {game.status ?? "ACTIVE"}
        </span>
      </div>

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

      <HomeGameActions
        gameId={game.id}
        isActionLoading={isActionLoading}
        onUpdateParticipation={onUpdateParticipation}
      />
    </div>
  );
}
