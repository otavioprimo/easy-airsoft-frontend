import { Trophy } from "lucide-react";

type HomeHeaderProps = {
  userName?: string;
  totalGames: number;
  isLoadingGames: boolean;
};

export function HomeHeader({
  userName,
  totalGames,
  isLoadingGames,
}: HomeHeaderProps) {
  return (
    <div className="rounded-3xl border border-primary/15 bg-white px-5 py-5 shadow-sm sm:px-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/70">
          Painel de jogos
        </p>
        <h1 className="text-2xl font-bold text-primary sm:text-3xl">
          Bem-vindo{userName ? `, ${userName}` : ""}
        </h1>
        <div className="inline-flex items-center gap-2 rounded-xl border border-primary/15 bg-primary/5 px-3 py-1.5 text-sm text-primary">
          <Trophy className="h-4 w-4" />
          {isLoadingGames ? "Carregando jogos..." : `${totalGames} jogos disponíveis`}
        </div>
      </div>
    </div>
  );
}
