import { Button } from "@/components/ui/button";
import type { ParticipationStatus } from "@/types/games";

type HomeGameActionsProps = {
  gameId: string;
  isActionLoading: boolean;
  onUpdateParticipation: (gameId: string, status: ParticipationStatus) => void;
};

export function HomeGameActions({
  gameId,
  isActionLoading,
  onUpdateParticipation,
}: HomeGameActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        disabled={isActionLoading}
        onClick={() => onUpdateParticipation(gameId, "CONFIRMED")}
      >
        {isActionLoading ? "Salvando..." : "Confirmar presença"}
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={isActionLoading}
        onClick={() => onUpdateParticipation(gameId, "INTERESTED")}
      >
        Tenho interesse
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={isActionLoading}
        onClick={() => onUpdateParticipation(gameId, "CANCELLED")}
      >
        Cancelar participação
      </Button>
    </div>
  );
}
