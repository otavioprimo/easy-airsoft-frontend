import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type HomeJoinTeamCardProps = {
  inviteCode: string;
  isSubmitting: boolean;
  errorMessage: string;
  successMessage: string;
  onInviteCodeChange: (value: string) => void;
  onSubmit: () => void;
};

export function HomeJoinTeamCard({
  inviteCode,
  isSubmitting,
  errorMessage,
  successMessage,
  onInviteCodeChange,
  onSubmit,
}: HomeJoinTeamCardProps) {
  return (
    <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.06)] sm:p-6">
      <div>
        <h2 className="text-lg font-semibold text-primary">Entrar em um time</h2>
        <p className="text-sm text-gray-600">
          Recebeu um convite? Digite o código para entrar no time.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Input
          value={inviteCode}
          onChange={(event) => {
            onInviteCodeChange(event.target.value.toUpperCase());
          }}
          placeholder="Ex.: A7K9P2QX"
          maxLength={12}
          className="w-full"
        />
        <Button className="w-full" onClick={onSubmit} disabled={isSubmitting || !inviteCode.trim()}>
          {isSubmitting ? "Entrando..." : "Entrar no time"}
        </Button>
      </div>

      {errorMessage && (
        <p className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      )}
      {successMessage && (
        <p className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {successMessage}
        </p>
      )}
    </div>
  );
}
