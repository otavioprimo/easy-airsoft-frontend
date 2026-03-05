import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { LocationDateFilters } from "@/types/filters";
import type { StateOption } from "@/types/ibge";

type HomeFilterProps = {
  filters: LocationDateFilters;
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
    <div className="bg-white rounded-2xl shadow p-4 md:p-5">
      <div className="grid md:grid-cols-5 gap-3 items-end">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Estado</label>
          <Select
            value={filters.state}
            onChange={(event) =>
              onChange({
                ...filters,
                state: event.target.value,
                city: "",
              })
            }
            disabled={isLoadingStates}
          >
            <option value="">
              {isLoadingStates ? "Carregando..." : "Selecione"}
            </option>
            {states.map((stateOption) => (
              <option key={stateOption.code} value={stateOption.code}>
                {stateOption.code} - {stateOption.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Cidade</label>
          <Select
            value={filters.city}
            onChange={(event) =>
              onChange({
                ...filters,
                city: event.target.value,
              })
            }
            disabled={!filters.state || isLoadingCities}
          >
            <option value="">
              {!filters.state
                ? "Selecione um estado"
                : isLoadingCities
                  ? "Carregando..."
                  : "Selecione"}
            </option>
            {cities.map((cityOption) => (
              <option key={cityOption} value={cityOption}>
                {cityOption}
              </option>
            ))}
          </Select>
        </div>

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
          <label className="text-sm font-medium text-gray-700">&nbsp;</label>
          <Button
            type="button"
            className="w-full"
            disabled={isSubmitting}
            onClick={onApply}
          >
            Aplicar filtros
          </Button>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">&nbsp;</label>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isSubmitting}
            onClick={onClear}
          >
            Limpar
          </Button>
        </div>
      </div>
    </div>
  );
}
