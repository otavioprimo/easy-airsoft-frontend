import { UserRound, UsersRound, LogOut, Trophy, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";

type HomeHeaderProps = {
  userName?: string;
  userPhoto?: string | null;
  totalGames: number;
  isLoadingGames: boolean;
  onOpenProfile: () => void;
  onCreateGame: () => void;
  onCreateTeam: () => void;
  onLogout: () => void;
};

export function HomeHeader({
  userName,
  userPhoto,
  totalGames,
  isLoadingGames,
  onOpenProfile,
  onCreateGame,
  onCreateTeam,
  onLogout,
}: HomeHeaderProps) {
  return (
    <div className="rounded-3xl border border-primary/15 bg-white px-5 py-5 shadow-sm sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={onCreateGame} className="bg-primary text-white hover:bg-primary/90">
            <Swords className="mr-2 h-4 w-4" />
            Criar jogo
          </Button>
          <Button
            variant="outline"
            onClick={onCreateTeam}
            className="border-primary/30 text-primary hover:bg-primary/5"
          >
            <UsersRound className="mr-2 h-4 w-4" />
            Criar time
          </Button>
          <Button
            variant="outline"
            onClick={onOpenProfile}
            className="border-primary/30 text-primary hover:bg-primary/5"
          >
            {userPhoto ? (
              <img
                src={userPhoto}
                alt="Foto de perfil"
                className="mr-2 h-5 w-5 rounded-full object-cover"
              />
            ) : (
              <UserRound className="mr-2 h-4 w-4" />
            )}
            Meu perfil
          </Button>
          <Button
            variant="ghost"
            onClick={onLogout}
            className="text-gray-700 hover:bg-gray-100"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>
    </div>
  );
}
