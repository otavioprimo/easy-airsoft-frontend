import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchSelect } from "@/components/ui/search-select";
import {
  RADIUS_FILTER_OPTIONS,
  type LocationDateFilters,
} from "@/types/filters";
import type { StateOption } from "@/types/ibge";

type HomeFilterProps = {
  filters: LocationDateFilters;
  isAuthenticated: boolean;
  hasUserLocation: boolean;
  states: StateOption[];
  cities: string[];
  isLoadingStates: boolean;
  isLoadingCities: boolean;
  isSubmitting: boolean;
  onApply: () => void;
  onClear: () => void;
  onChange: (nextFilters: LocationDateFilters) => void;
};

export function HomeFilter({
  filters,
  isAuthenticated,
  hasUserLocation,
  states,
  cities,
  isLoadingStates,
  isLoadingCities,
  isSubmitting,
  onApply,
  onClear,
  onChange,
}: HomeFilterProps) {
  return (
    <div className="space-y-4 rounded-3xl border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#fbfdff_100%)] p-4 shadow-[0_10px_28px_rgba(15,23,42,0.06)] md:p-5">
      <div>
        <h2 className="text-base font-bold text-gray-900">Filtros de busca</h2>
        <p className="text-sm text-gray-600">Refine os jogos por região, data e distância.</p>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Estado</label>
            <SearchSelect
              items={(states ?? []).map((stateOption) => ({
                value: stateOption.code,
                label: `${stateOption.code} - ${stateOption.name}`,
              }))}
              value={filters.state}
              onChange={(nextState) =>
                onChange({
                  ...filters,
                  state: nextState,
                  city: "",
                })
              }
              placeholder={isLoadingStates ? "Carregando..." : "Selecione"}
              searchPlaceholder="Buscar estado..."
              emptyText="Nenhum estado encontrado."
              classNameList="max-h-64"
              disabled={isLoadingStates}
              clearable
              onClear={() =>
                onChange({
                  ...filters,
                  state: "",
                  city: "",
                })
              }
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Cidade</label>
            <SearchSelect
              items={(cities ?? []).map((cityOption) => ({
                value: cityOption,
                label: cityOption,
              }))}
              value={filters.city}
              onChange={(nextCity) =>
                onChange({
                  ...filters,
                  city: nextCity,
                })
              }
              placeholder={!filters.state
                ? "Selecione um estado"
                : isLoadingCities
                  ? "Carregando..."
                  : "Selecione"}
              searchPlaceholder="Buscar cidade..."
              emptyText="Nenhuma cidade encontrada."
              classNameList="max-h-64"
              disabled={!filters.state || isLoadingCities}
              clearable
              onClear={() =>
                onChange({
                  ...filters,
                  city: "",
                })
              }
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Data</label>
            <Input
              type="date"
              value={filters.date}
              onChange={(event) =>
                onChange({
                  ...filters,
                  date: event.target.value,
                })
              }
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Raio (km)</label>
            <SearchSelect
              items={RADIUS_FILTER_OPTIONS.map((radiusOption) => ({
                value: String(radiusOption),
                label: `${radiusOption} km`,
              }))}
              value={String(filters.radiusKm)}
              disabled={!hasUserLocation}
              onChange={(nextRadius) =>
                onChange({
                  ...filters,
                  radiusKm: Number(nextRadius) || 100,
                })
              }
              placeholder="Selecione"
              searchPlaceholder="Buscar raio..."
              emptyText="Nenhum raio encontrado."
              classNameList="max-h-64"
            />
            {!hasUserLocation && (
              <p className="text-xs text-amber-700">
                Ative a localização para filtrar por distância.
              </p>
            )}
          </div>
        </div>

        {isAuthenticated && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5">
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                checked={filters.followingOnly}
                onChange={(event) =>
                  onChange({
                    ...filters,
                    followingOnly: event.target.checked,
                  })
                }
              />
              Mostrar apenas jogos dos times que sigo
            </label>
          </div>
        )}

        <div className="flex flex-col gap-2 border-t border-slate-200 pt-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            disabled={isSubmitting}
            onClick={onClear}
          >
            Limpar
          </Button>
          <Button
            type="button"
            className="w-full sm:w-auto"
            disabled={isSubmitting}
            onClick={onApply}
          >
            Buscar jogos
          </Button>
        </div>
      </div>
    </div>
  );
}
