import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { useAuth } from "@/hooks/useAuth";
import { setPendingTeamInviteCode } from "@/lib/team-invite";

export default function InviteTeamPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const inviteCode = (searchParams.get("code") || "").trim().toUpperCase();

    if (!inviteCode) {
      navigate(isAuthenticated ? "/app" : "/login", { replace: true });
      return;
    }

    setPendingTeamInviteCode(inviteCode);
    navigate(isAuthenticated ? "/app" : "/login", { replace: true });
  }, [isAuthenticated, isLoading, navigate, searchParams]);

  return (
    <AuthLayout
      title="Convite de time"
      subtitle="Preparando seu convite. Você será redirecionado em instantes."
    >
      <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
        Processando convite...
      </div>
    </AuthLayout>
  );
}
