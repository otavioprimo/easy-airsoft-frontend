import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function HomePage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-neutral-light p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">
              Bem-vindo{user ? `, ${user.name}` : ""}
            </h1>
            <p className="text-gray-600 text-sm">
              Área autenticada do Easy Airsoft
            </p>
          </div>
          <Button variant="outline" onClick={logout}>
            Sair
          </Button>
        </div>

        {user && !user.emailVerified && (
          <div className="bg-amber-50 border-2 border-amber-200 text-amber-900 rounded-xl p-4">
            Seu email ainda não foi confirmado. Verifique sua caixa de entrada
            para ativar a conta.
          </div>
        )}
      </div>
    </div>
  );
}
