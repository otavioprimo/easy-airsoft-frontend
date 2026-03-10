import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { GameItem } from "@/types/games";

type ParticipationTab = "CONFIRMED" | "INTERESTED";

type HomeParticipationListsProps = {
  games: GameItem[];
  isLoading: boolean;
  formatDate: Intl.DateTimeFormat;
};

function sortByDateAsc(items: GameItem[]) {
  return [...items].sort(
    (firstItem, secondItem) =>
      new Date(firstItem.datetime).getTime() -
      new Date(secondItem.datetime).getTime(),
  );
}

function isFutureGame(game: GameItem) {
  return new Date(game.datetime).getTime() > Date.now();
}

export function HomeParticipationLists({
  games,
  isLoading,
  formatDate,
}: HomeParticipationListsProps) {
  const [activeTab, setActiveTab] = useState<ParticipationTab>("CONFIRMED");

  const confirmedGames = useMemo(() => {
    return sortByDateAsc(
      games.filter(
        (game) =>
          game.myParticipationStatus === "CONFIRMED" && isFutureGame(game),
      ),
    );
  }, [games]);

  const interestedGames = useMemo(() => {
    return sortByDateAsc(
      games.filter(
        (game) =>
          game.myParticipationStatus === "INTERESTED" && isFutureGame(game),
      ),
    );
  }, [games]);

  const visibleGames = activeTab === "CONFIRMED" ? confirmedGames : interestedGames;
  const activeLabel = activeTab === "CONFIRMED" ? "confirmou presença" : "tem interesse";

  return (
    <section className="space-y-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.06)] sm:p-5">
      <div className="space-y-1">
        <h2 className="text-base font-semibold text-gray-900">Minha participação</h2>
        <p className="text-sm text-gray-600">
          Acompanhe rápido os jogos em que você {activeLabel}.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          size="sm"
          variant={activeTab === "CONFIRMED" ? "default" : "outline"}
          className="text-xs sm:text-sm"
          onClick={() => {
            setActiveTab("CONFIRMED");
          }}
        >
          Confirmados ({confirmedGames.length})
        </Button>
        <Button
          type="button"
          size="sm"
          variant={activeTab === "INTERESTED" ? "default" : "outline"}
          className="text-xs sm:text-sm"
          onClick={() => {
            setActiveTab("INTERESTED");
          }}
        >
          Interesse ({interestedGames.length})
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : visibleGames.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
          Nenhum jogo nesta lista no momento.
        </div>
      ) : (
        <div className="space-y-2">
          {visibleGames.slice(0, 4).map((game) => {
            const city = game.field?.city || game.city;
            const state = game.field?.state || game.state;

            return (
              <Link
                key={game.id}
                to={`/app/games/${game.id}`}
                className="block rounded-xl border border-slate-200 bg-slate-50 p-3 transition-colors hover:border-primary/40 hover:bg-primary/5"
              >
                <article>
                  <p className="truncate text-sm font-semibold text-gray-900">{game.title}</p>
                  <p className="mt-1 text-xs text-gray-600">
                    {formatDate.format(new Date(game.datetime))}
                  </p>
                  <p className="mt-1 truncate text-xs text-gray-600">
                    {city && state ? `${city}/${state}` : "Local não informado"}
                  </p>
                </article>
              </Link>
            );
          })}

          {visibleGames.length > 4 && (
            <p className="text-xs text-gray-500">
              +{visibleGames.length - 4} jogo(s) nesta categoria.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
