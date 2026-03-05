import { Button } from "@/components/ui/button";

type HomeHeaderProps = {
  userName?: string;
  isRefreshing: boolean;
  isLoading: boolean;
  onCreateTeam: () => void;
  onRefresh: () => void;
  onLogout: () => void;
};

export function HomeHeader({
  userName,
  isRefreshing,
  isLoading,
  onCreateTeam,
  onRefresh,
  onLogout,
}: HomeHeaderProps) {
  return (
    <div className="bg-white rounded-2xl shadow p-6 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-primary">
          Bem-vindo{userName ? `, ${userName}` : ""}
        </h1>
        <p className="text-gray-600 text-sm">
          Próximos jogos disponíveis na sua região
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={onCreateTeam}>Criar time</Button>
        <Button
          variant="outline"
          onClick={onRefresh}
          disabled={isRefreshing || isLoading}
        >
          {isRefreshing ? "Atualizando..." : "Atualizar"}
        </Button>
        <Button variant="outline" onClick={onLogout}>
          Sair
        </Button>
      </div>
    </div>
  );
}
