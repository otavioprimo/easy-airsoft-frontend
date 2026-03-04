import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
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
    <div className="min-h-screen flex items-center justify-center bg-neutral-light p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6 text-center">
        <h1 className="text-2xl font-bold text-primary">
          Confirmação de email
        </h1>

        {status === "loading" && (
          <p className="text-gray-600">Validando token...</p>
        )}
        {status === "success" && (
          <p className="text-emerald-700 font-medium">{message}</p>
        )}
        {status === "error" && (
          <p className="text-red-700 font-medium">{message}</p>
        )}

        <Link to="/login">
          <Button className="w-full" size="lg">
            Ir para login
          </Button>
        </Link>
      </div>
    </div>
  );
}
