import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchSelect } from "@/components/ui/search-select";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  useIbgeCitiesByStateQuery,
  useIbgeStatesQuery,
} from "@/hooks/queries/useIbgeQueries";
import { useSearchTeamsQuery } from "@/hooks/queries/useTeamsQueries";

type TeamSearchFilters = {
  name: string;
  city: string;
  state: string;
};

const EMPTY_FILTERS: TeamSearchFilters = {
  name: "",
  city: "",
  state: "",
};

export default function SearchTeamsPage() {
  const [filters, setFilters] = useState<TeamSearchFilters>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<TeamSearchFilters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);

  const statesQuery = useIbgeStatesQuery();
  const citiesQuery = useIbgeCitiesByStateQuery(filters.state);
  const teamsQuery = useSearchTeamsQuery(appliedFilters, page);

  const teams = teamsQuery.data?.items ?? [];
  const total = teamsQuery.data?.pagination.total ?? 0;
  const totalPages = teamsQuery.data?.pagination.totalPages ?? 1;

  const hasActiveFilters = useMemo(() => {
    return Boolean(
      appliedFilters.name.trim() ||
        appliedFilters.city.trim() ||
        appliedFilters.state.trim(),
    );
  }, [appliedFilters]);

  return (
    <AppShell>
      <Helmet>
        <title>Buscar times de airsoft – Arenna Airsoft</title>
        <meta
          name="description"
          content="Pesquise times de airsoft por nome, estado e cidade. Encontre seu próximo time no Arenna Airsoft."
        />
        <meta name="robots" content="index, follow" />
      </Helmet>
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-3xl border border-primary/20 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-primary">Buscar times</h1>
          <p className="mt-1 text-sm text-gray-600">
            Encontre times por nome, estado e cidade.
          </p>
        </header>

        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Nome do time</label>
              <Input
                value={filters.name}
                placeholder="Ex.: Zulumafu"
                onChange={(event) => {
                  setFilters((current) => ({
                    ...current,
                    name: event.target.value,
                  }));
                }}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Estado</label>
              <SearchSelect
                items={(statesQuery.data ?? []).map((stateOption) => ({
                  value: stateOption.code,
                  label: `${stateOption.code} - ${stateOption.name}`,
                }))}
                value={filters.state}
                onChange={(nextState) =>
                  setFilters((current) => ({
                    ...current,
                    state: nextState,
                    city: "",
                  }))
                }
                placeholder={statesQuery.isLoading ? "Carregando..." : "Selecione"}
                searchPlaceholder="Buscar estado..."
                emptyText="Nenhum estado encontrado."
                classNameList="max-h-64"
                disabled={statesQuery.isLoading}
                clearable
                onClear={() =>
                  setFilters((current) => ({
                    ...current,
                    state: "",
                    city: "",
                  }))
                }
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Cidade</label>
              <SearchSelect
                items={(citiesQuery.data ?? []).map((cityOption) => ({
                  value: cityOption,
                  label: cityOption,
                }))}
                value={filters.city}
                onChange={(nextCity) =>
                  setFilters((current) => ({
                    ...current,
                    city: nextCity,
                  }))
                }
                placeholder={!filters.state
                  ? "Selecione um estado"
                  : citiesQuery.isLoading
                    ? "Carregando..."
                    : "Selecione"}
                searchPlaceholder="Buscar cidade..."
                emptyText="Nenhuma cidade encontrada."
                classNameList="max-h-64"
                disabled={!filters.state || citiesQuery.isLoading}
                clearable
                onClear={() =>
                  setFilters((current) => ({
                    ...current,
                    city: "",
                  }))
                }
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-slate-200 pt-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFilters(EMPTY_FILTERS);
                setAppliedFilters(EMPTY_FILTERS);
                setPage(1);
              }}
            >
              Limpar
            </Button>
            <Button
              type="button"
              onClick={() => {
                setPage(1);
                setAppliedFilters({
                  name: filters.name.trim(),
                  city: filters.city.trim(),
                  state: filters.state.trim().toUpperCase(),
                });
              }}
            >
              Buscar times
            </Button>
          </div>
        </section>

        <section className="space-y-3 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-primary">Resultados</h2>
            <span className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-600">
              {teamsQuery.isLoading ? "..." : `${total} time(s)`}
            </span>
          </div>

          {teamsQuery.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : teams.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
              {hasActiveFilters
                ? "Nenhum time encontrado com esses filtros."
                : "Nenhum time disponível para listagem no momento."}
            </div>
          ) : (
            <div className="grid gap-3">
              {teams.map((team) => (
                <Link
                  key={team.id}
                  to={`/teams/${team.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {team.logoUrl ? (
                      <img
                        src={team.logoUrl}
                        alt={`Logo do time ${team.name}`}
                        className="h-11 w-11 rounded-lg border border-gray-200 object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-sm font-bold text-primary">
                        {team.name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-900">{team.name}</p>
                      <p className="text-sm text-gray-600">
                        {team.city && team.state
                          ? `${team.city}/${team.state}`
                          : "Localização não informada"}
                      </p>
                    </div>
                  </div>

                  <span className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600">
                    {team.followersCount ?? 0} seguidor(es)
                  </span>
                </Link>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1 || teamsQuery.isLoading}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Anterior
              </Button>

              <span className="text-sm text-gray-600">
                Página {page} de {totalPages}
              </span>

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= totalPages || teamsQuery.isLoading}
                onClick={() => setPage((p) => p + 1)}
              >
                Próxima
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
