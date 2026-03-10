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
    <div className="rounded-3xl border border-primary/15 bg-[linear-gradient(145deg,#ffffff_35%,#f2f7ff_100%)] px-5 py-5 shadow-[0_10px_28px_rgba(15,23,42,0.07)] sm:px-6">
      <div className="space-y-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary/60">
          Painel de Jogos
        </p>
        <h1 className="text-2xl font-extrabold text-primary sm:text-3xl">
          Bem-vindo{userName ? `, ${userName}` : ""}
        </h1>
        <div className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-primary/20 bg-white px-3 py-1.5 text-sm font-medium text-primary shadow-sm">
          <Trophy className="h-4 w-4" />
          {isLoadingGames ? "Carregando jogos..." : `${totalGames} jogos disponíveis`}
        </div>
      </div>
    </div>
  );
}
