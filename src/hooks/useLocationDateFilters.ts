import { useEffect, useMemo, useState } from "react";
import { parseAsString, useQueryStates } from "nuqs";
import {
  EMPTY_LOCATION_DATE_FILTERS,
  type LocationDateFilters,
} from "@/types/filters";

function normalizeFilters(filters: LocationDateFilters): LocationDateFilters {
  const parsedRadius = Number(filters.radiusKm);
  const normalizedRadius =
    Number.isFinite(parsedRadius) && parsedRadius > 0 ? parsedRadius : 100;

  return {
    city: filters.city.trim(),
    state: filters.state.trim().toUpperCase(),
    date: filters.date,
    radiusKm: Math.round(normalizedRadius),
  };
}

export function useLocationDateFilters() {
  const [queryFilters, setQueryFilters] = useQueryStates(
    {
      city: parseAsString.withDefault(""),
      state: parseAsString.withDefault(""),
      date: parseAsString.withDefault(""),
      radiusKm: parseAsString.withDefault("100"),
    },
    {
      history: "replace",
      clearOnDefault: true,
    },
  );

  const normalizedQueryFilters = useMemo(() => {
    return normalizeFilters({
      city: queryFilters.city,
      state: queryFilters.state,
      date: queryFilters.date,
      radiusKm: Number(queryFilters.radiusKm),
    });
  }, [queryFilters]);

  const [filters, setFilters] = useState<LocationDateFilters>(
    normalizedQueryFilters,
  );
  const [appliedFilters, setAppliedFilters] = useState<LocationDateFilters>(
    normalizedQueryFilters,
  );

  useEffect(() => {
    setFilters(normalizedQueryFilters);
    setAppliedFilters(normalizedQueryFilters);
  }, [normalizedQueryFilters]);

  const applyFilters = (nextFilters?: LocationDateFilters) => {
    const normalized = normalizeFilters(nextFilters ?? filters);
    setFilters(normalized);
    setAppliedFilters(normalized);
    void setQueryFilters({
      city: normalized.city,
      state: normalized.state,
      date: normalized.date,
      radiusKm: String(normalized.radiusKm),
    });
    return normalized;
  };

  const clearFilters = () => {
    setFilters(EMPTY_LOCATION_DATE_FILTERS);
    setAppliedFilters(EMPTY_LOCATION_DATE_FILTERS);
    void setQueryFilters({
      city: EMPTY_LOCATION_DATE_FILTERS.city,
      state: EMPTY_LOCATION_DATE_FILTERS.state,
      date: EMPTY_LOCATION_DATE_FILTERS.date,
      radiusKm: String(EMPTY_LOCATION_DATE_FILTERS.radiusKm),
    });
    return EMPTY_LOCATION_DATE_FILTERS;
  };

  return {
    filters,
    setFilters,
    appliedFilters,
    applyFilters,
    clearFilters,
  };
}
