import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { ParticipationStatus } from "@/types/games";

type HomeGameActionsProps = {
  gameId: string;
  currentStatus: ParticipationStatus | null;
  isActionLoading: boolean;
  onUpdateParticipation: (gameId: string, status: ParticipationStatus) => void;
};

export function HomeGameActions({
  gameId,
  currentStatus,
  isActionLoading,
  onUpdateParticipation,
}: HomeGameActionsProps) {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const handlePrimaryAction = () => {
    if (currentStatus === "CONFIRMED") {
      setIsConfirmModalOpen(true);
      return;
    }

    onUpdateParticipation(gameId, "CONFIRMED");
  };

  const handleSecondaryAction = () => {
    onUpdateParticipation(
      gameId,
      currentStatus === "INTERESTED" ? "CANCELLED" : "INTERESTED",
    );
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={currentStatus === "CONFIRMED" ? "outline" : "default"}
          disabled={isActionLoading}
          onClick={handlePrimaryAction}
        >
          {isActionLoading
            ? "Salvando..."
            : currentStatus === "CONFIRMED"
              ? "Não vou mais"
              : "Confirmar presença"}
        </Button>
        {currentStatus !== "CONFIRMED" && (
          <Button
            size="sm"
            variant="outline"
            disabled={isActionLoading}
            onClick={handleSecondaryAction}
          >
            {currentStatus === "INTERESTED"
              ? "Não tenho mais interesse"
              : "Tenho interesse"}
          </Button>
        )}
      </div>

      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">
              Confirmar saída
            </h3>
            <p className="mt-2 text-sm text-gray-700">
              Tem certeza que você não vai mais neste jogo?
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (!isActionLoading) {
                    setIsConfirmModalOpen(false);
                  }
                }}
                disabled={isActionLoading}
              >
                Voltar
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isActionLoading}
                onClick={() => {
                  onUpdateParticipation(gameId, "CANCELLED");
                  setIsConfirmModalOpen(false);
                }}
              >
                {isActionLoading ? "Salvando..." : "Confirmar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
