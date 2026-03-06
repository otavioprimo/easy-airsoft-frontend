import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { AuthLayout } from "@/components/layout/AuthLayout";
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
    <AuthLayout
      title="Recuperar senha"
      subtitle="Informe seu e-mail para receber o link de redefinição."
      footer={
        <p className="text-center text-sm text-gray-600">
          Lembrou sua senha?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Voltar ao login
          </Link>
        </p>
      }
    >
      <div className="space-y-5">
        {error && (
          <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="space-y-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
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
      </div>
    </AuthLayout>
  );
}
