import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

type Status = "idle" | "loading" | "success" | "error";

export default function ConfirmEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>(token ? "idle" : "error");
  const [message, setMessage] = useState(
    token ? "" : "Token de confirmação não encontrado.",
  );

  useEffect(() => {
    if (!token) {
      return;
    }

    const run = async () => {
      setStatus("loading");
      try {
        await api.get("/auth/confirm-email", { params: { token } });
        setStatus("success");
        setMessage("Email confirmado com sucesso.");
      } catch (err) {
        const apiError = err as { response?: { data?: { message?: string } } };
        setStatus("error");
        setMessage(
          apiError.response?.data?.message ||
            "Não foi possível confirmar o email.",
        );
      }
    };

    run();
  }, [token]);

  return (
    <AuthLayout
      title="Confirmação de email"
      subtitle="Estamos validando seu token para concluir a ativação da conta."
    >
      <div className="space-y-5 text-center sm:text-left">
        {status === "loading" && (
          <p className="rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-700">
            Validando token...
          </p>
        )}
        {status === "success" && (
          <p className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 font-medium text-emerald-700">
            {message}
          </p>
        )}
        {status === "error" && (
          <p className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 font-medium text-red-700">
            {message}
          </p>
        )}

        <Link to="/login" className="block">
          <Button className="w-full" size="lg">
            Ir para login
          </Button>
        </Link>
      </div>
    </AuthLayout>
  );
}
