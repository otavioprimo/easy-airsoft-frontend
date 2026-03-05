import { HomeGameCard } from "./HomeGameCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { GameItem, ParticipationStatus } from "@/types/games";

type GameActionMutation = {
  isPending: boolean;
  variables?: {
    gameId?: string;
  };
};

type HomeGameListProps = {
  games: GameItem[];
  isLoading: boolean;
  updateParticipationMutation: GameActionMutation;
  onUpdateParticipation: (gameId: string, status: ParticipationStatus) => void;
  formatDate: Intl.DateTimeFormat;
};

export function HomeGameList({
  games,
  isLoading,
  updateParticipationMutation,
  onUpdateParticipation,
  formatDate,
}: HomeGameListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={`home-game-skeleton-${index}`}
            className="bg-white rounded-2xl shadow p-5 space-y-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 w-full">
                <Skeleton className="h-6 w-2/5" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-4/5" />
              </div>
              <Skeleton className="h-6 w-20 rounded-md" />
            </div>

            <div className="grid md:grid-cols-2 gap-2">
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-2/5" />
            </div>

            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-9 w-40 rounded-lg" />
              <Skeleton className="h-9 w-32 rounded-lg" />
              <Skeleton className="h-9 w-36 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow p-6 text-gray-700">
        Nenhum jogo ativo encontrado no momento.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {games.map((game) => {
        const isActionLoading =
          updateParticipationMutation.isPending &&
          updateParticipationMutation.variables?.gameId === game.id;

        return (
          <HomeGameCard
            key={game.id}
            game={game}
            isActionLoading={isActionLoading}
            formatDate={formatDate}
            onUpdateParticipation={onUpdateParticipation}
          />
        );
      })}
    </div>
  );
}
