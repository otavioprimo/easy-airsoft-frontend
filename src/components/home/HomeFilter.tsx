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
    <div className="space-y-4 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
      <div>
        <h2 className="text-base font-semibold text-gray-900">Filtros de busca</h2>
        <p className="text-sm text-gray-600">Refine os jogos por região e data.</p>
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

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
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
