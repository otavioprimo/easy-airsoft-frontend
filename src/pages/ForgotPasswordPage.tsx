import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { api } from "@/lib/api";

const schema = z.object({
  email: z.string().min(1, "E-mail é obrigatório").email("E-mail inválido"),
});

type FormData = z.infer<typeof schema>;

type ForgotPasswordResponse = {
  requested: true;
  previewUrl: string | null;
};

export default function ForgotPasswordPage() {
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError("");
    setSuccessMessage("");
    setPreviewUrl(null);

    try {
      const response = await api.post<{
        success: boolean;
        data: ForgotPasswordResponse;
      }>("/auth/forgot-password", data);

      setSuccessMessage(
        "Se o e-mail existir, enviamos um link de recuperação.",
      );
      setPreviewUrl(response.data.data.previewUrl);
    } catch (err) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(
        apiError.response?.data?.message ||
          "Não foi possível processar a solicitação.",
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary/95 to-neutral-dark p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-primary">Recuperar senha</h1>
          <p className="text-gray-500 text-sm">
            Informe seu e-mail para receber o link de recuperação
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-50 border-2 border-emerald-200 text-emerald-900 px-4 py-3 rounded-lg text-sm space-y-2">
            <p>{successMessage}</p>
            {previewUrl && (
              <a
                href={previewUrl}
                target="_blank"
                rel="noreferrer"
                className="font-semibold underline"
              >
                Abrir email de teste
              </a>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            error={errors.email?.message}
            {...register("email")}
          />

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enviando..." : "Enviar link"}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Lembrou sua senha?{" "}
          <Link
            to="/login"
            className="font-semibold text-primary hover:underline"
          >
            Voltar ao login
          </Link>
        </p>
      </div>
    </div>
  );
}
