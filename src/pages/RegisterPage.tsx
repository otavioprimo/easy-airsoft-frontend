import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { useAuth } from "@/hooks/useAuth";

const registerSchema = z
  .object({
    name: z.string().min(2, "Nome é obrigatório"),
    username: z
      .string()
      .min(3, "Username deve ter no mínimo 3 caracteres")
      .regex(/^[a-z0-9_]+$/, "Use apenas letras minúsculas, números e _"),
    email: z.string().min(1, "E-mail é obrigatório").email("E-mail inválido"),
    password: z
      .string()
      .min(8, "A senha deve ter no mínimo 8 caracteres")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/,
        "Use maiúscula, minúscula, número e caractere especial",
      ),
    confirmPassword: z.string().min(8, "Confirme sua senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "A confirmação de senha não confere",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const passwordValue = watch("password") ?? "";
  const passwordChecks = [
    {
      label: "Pelo menos 8 caracteres",
      valid: passwordValue.length >= 8,
    },
    {
      label: "Letra maiúscula",
      valid: /[A-Z]/.test(passwordValue),
    },
    {
      label: "Letra minúscula",
      valid: /[a-z]/.test(passwordValue),
    },
    {
      label: "Número",
      valid: /\d/.test(passwordValue),
    },
    {
      label: "Caractere especial",
      valid: /[^A-Za-z\d]/.test(passwordValue),
    },
  ];

  const passwordScore = passwordChecks.filter((item) => item.valid).length;
  const strength =
    passwordScore <= 2
      ? { label: "Fraca", color: "bg-red-500" }
      : passwordScore <= 4
        ? { label: "Média", color: "bg-amber-500" }
        : { label: "Forte", color: "bg-emerald-500" };

  const onSubmit = async (data: RegisterFormData) => {
    setError("");
    setPreviewUrl(null);

    try {
      const emailConfirmation = await registerUser(data);

      if (emailConfirmation.previewUrl) {
        setPreviewUrl(emailConfirmation.previewUrl);
        return;
      }

      navigate("/app");
    } catch (err) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || "Erro ao criar conta.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary/95 to-neutral-dark p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-primary">Criar conta</h1>
          <p className="text-gray-500 text-sm">Cadastre-se no Easy Airsoft</p>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {previewUrl && (
          <div className="bg-emerald-50 border-2 border-emerald-200 text-emerald-900 px-4 py-3 rounded-lg text-sm space-y-2">
            <p>Email de confirmação enviado (modo teste).</p>
            <a
              href={previewUrl}
              target="_blank"
              rel="noreferrer"
              className="font-semibold underline"
            >
              Abrir email de teste
            </a>
            <div>
              <button
                type="button"
                onClick={() => navigate("/app")}
                className="font-semibold underline"
              >
                Continuar para o app
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            label="Nome"
            placeholder="Seu nome"
            error={errors.name?.message}
            {...register("name")}
          />

          <FormField
            label="Username"
            placeholder="seu_username"
            error={errors.username?.message}
            {...register("username")}
          />

          <FormField
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            error={errors.email?.message}
            {...register("email")}
          />

          <FormField
            label="Senha"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register("password")}
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Força da senha</span>
              <span className="font-semibold text-gray-800">
                {strength.label}
              </span>
            </div>
            <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
              <div
                className={`h-full transition-all ${strength.color}`}
                style={{
                  width: `${(passwordScore / passwordChecks.length) * 100}%`,
                }}
              />
            </div>
            <ul className="text-xs space-y-1 text-gray-600">
              {passwordChecks.map((item) => (
                <li
                  key={item.label}
                  className={item.valid ? "text-emerald-700" : "text-gray-500"}
                >
                  {item.valid ? "✓" : "•"} {item.label}
                </li>
              ))}
            </ul>
          </div>

          <FormField
            label="Confirmar senha"
            type="password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Criando conta..." : "Criar conta"}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Já tem uma conta?{" "}
          <Link
            to="/login"
            className="font-semibold text-primary hover:underline"
          >
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
