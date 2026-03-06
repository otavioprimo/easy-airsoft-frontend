import type { ReactNode } from "react";

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-primary px-4 py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,theme(colors.accent/.18),transparent_56%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,theme(colors.neutral-light/.14),transparent_52%)]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-8">
        <section className="hidden flex-1 flex-col gap-6 rounded-3xl border border-white/15 bg-white/8 p-10 text-white backdrop-blur-md lg:flex">
          <span className="inline-flex w-fit items-center rounded-full border border-white/30 bg-white/10 px-4 py-1 text-xs font-semibold tracking-[0.18em] uppercase">
            Easy Airsoft
          </span>
          <h2 className="max-w-lg text-4xl leading-tight font-semibold">
            Organize partidas, conecte times e acelere sua operação.
          </h2>
          <p className="max-w-md text-sm text-white/80">
            Painel completo para gestão de jogos, times e confirmações em uma
            única experiência.
          </p>
          <ul className="mt-2 space-y-3 text-sm text-white/85">
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent" />
              Agenda unificada de jogos por região
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent" />
              Gestão de participação em tempo real
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent" />
              Criação de times com identidade própria
            </li>
          </ul>
        </section>

        <section className="w-full max-w-xl rounded-3xl border border-white/40 bg-white p-6 shadow-2xl sm:p-8">
          <header className="mb-6 space-y-2 text-center sm:text-left">
            <h1 className="text-3xl font-bold text-primary">{title}</h1>
            <p className="text-sm text-gray-600">{subtitle}</p>
          </header>
          {children}
          {footer && <footer className="mt-6">{footer}</footer>}
        </section>
      </div>
    </div>
  );
}
