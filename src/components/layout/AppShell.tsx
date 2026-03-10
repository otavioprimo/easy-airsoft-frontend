import { useMemo, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Menu,
  Search,
  ShieldUser,
  Swords,
  Users,
  X,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: ReactNode;
};

type NavigationItem = {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: (pathname: string) => boolean;
};

export function AppShell({ children }: AppShellProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = useMemo<NavigationItem[]>(() => {
    if (!isAuthenticated) {
      return [];
    }

    return [
      {
        label: "Início",
        to: "/app",
        icon: Home,
        isActive: (pathname) => pathname === "/app",
      },
      {
        label: "Meu perfil",
        to: "/app/profile",
        icon: ShieldUser,
        isActive: (pathname) => pathname === "/app/profile",
      },
      {
        label: "Meus times",
        to: "/app/teams",
        icon: Users,
        isActive: (pathname) => pathname === "/app/teams",
      },
      {
        label: "Buscar times",
        to: "/app/teams/search",
        icon: Search,
        isActive: (pathname) => pathname === "/app/teams/search",
      },
      {
        label: "Criar jogo",
        to: "/app/games/new",
        icon: Swords,
        isActive: (pathname) => pathname === "/app/games/new",
      },
    ];
  }, [isAuthenticated]);

  const homeLink = isAuthenticated ? "/app" : "/login";

  const userInitial = (user?.name?.trim().charAt(0) || "U").toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-neutral-light">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
          <Link to={homeLink} className="flex items-center gap-2">
            <div className="rounded-lg bg-primary px-2 py-1 text-sm font-bold text-white shadow-sm">
              EA
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary/70">
              Easy Airsoft
            </p>
          </Link>

          {isAuthenticated ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsMobileMenuOpen((current) => !current);
              }}
              aria-label="Abrir menu"
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          ) : (
            <Link to="/login">
              <Button type="button" variant="outline" size="sm">
                Entrar
              </Button>
            </Link>
          )}
        </div>
      </header>

      {isAuthenticated && isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            onClick={closeMobileMenu}
            aria-label="Fechar menu"
          />

          <aside className="relative z-10 flex h-full w-[88%] max-w-xs flex-col border-r border-primary/20 bg-white p-4 shadow-2xl">
            <div className="mb-4 rounded-2xl border border-primary/20 bg-[linear-gradient(140deg,#ffffff_30%,#f4f8ff_100%)] p-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary/70">
                Easy Airsoft
              </p>
            </div>

            <nav className="space-y-1.5">
              {navigationItems.map((item) => {
                const isActive = item.isActive(location.pathname);
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={closeMobileMenu}
                    className={cn(
                      "group flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-semibold transition-all",
                      isActive
                        ? "bg-primary text-white shadow-[0_8px_20px_rgba(10,31,68,0.22)]"
                        : "text-gray-700 hover:bg-primary/5 hover:text-primary",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-lg border transition-colors",
                        isActive
                          ? "border-white/25 bg-white/15"
                          : "border-slate-200 bg-white group-hover:border-primary/30 group-hover:bg-white",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>

            <div className="mt-auto space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center gap-3">
                {user?.profilePhoto ? (
                  <img
                    src={user.profilePhoto}
                    alt="Foto de perfil"
                    className="h-10 w-10 rounded-full border border-gray-200 object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-sm font-semibold text-primary">
                    {userInitial}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {user?.name || "Usuário"}
                  </p>
                  <p className="truncate text-xs text-gray-600">{user?.email || ""}</p>
                </div>
              </div>

              <Button type="button" variant="outline" className="w-full" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>

          </aside>
        </div>
      )}

      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-4 sm:px-6 sm:py-6">
        <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-72 shrink-0 flex-col rounded-3xl border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4 shadow-[0_12px_28px_rgba(15,23,42,0.08)] lg:flex">
          <div className="mb-4 rounded-2xl border border-primary/20 bg-[linear-gradient(140deg,#ffffff_30%,#f4f8ff_100%)] p-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary/70">
              Easy Airsoft
            </p>
          </div>

          {isAuthenticated ? (
            <>
              <nav className="space-y-1.5">
                {navigationItems.map((item) => {
                  const isActive = item.isActive(location.pathname);
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={cn(
                        "group flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-semibold transition-all",
                        isActive
                          ? "bg-primary text-white shadow-[0_8px_20px_rgba(10,31,68,0.22)]"
                          : "text-gray-700 hover:bg-primary/5 hover:text-primary",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-7 w-7 items-center justify-center rounded-lg border transition-colors",
                          isActive
                            ? "border-white/25 bg-white/15"
                            : "border-slate-200 bg-white group-hover:border-primary/30 group-hover:bg-white",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      {item.label}
                    </NavLink>
                  );
                })}
              </nav>

              <div className="mt-auto space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center gap-3">
                  {user?.profilePhoto ? (
                    <img
                      src={user.profilePhoto}
                      alt="Foto de perfil"
                      className="h-10 w-10 rounded-full border border-gray-200 object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-sm font-semibold text-primary">
                      {userInitial}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {user?.name || "Usuário"}
                    </p>
                    <p className="truncate text-xs text-gray-600">{user?.email || ""}</p>
                  </div>
                </div>

                <Button type="button" variant="outline" className="w-full" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  Sair
                </Button>
              </div>
            </>
          ) : (
            <div className="mt-auto space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-gray-700">
                Para participar dos jogos e interagir com times, entre na sua conta.
              </p>
              <div className="flex gap-2">
                <Link to="/login" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Entrar
                  </Button>
                </Link>
                <Link to="/register" className="flex-1">
                  <Button type="button" className="w-full">
                    Cadastrar
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </aside>

        <main className="min-w-0 flex-1 space-y-6">{children}</main>
      </div>
    </div>
  );
}
