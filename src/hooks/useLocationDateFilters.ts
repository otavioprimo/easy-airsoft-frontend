import { useEffect, useMemo, useState } from "react";
import { parseAsString, useQueryStates } from "nuqs";
import {
  EMPTY_LOCATION_DATE_FILTERS,
  type LocationDateFilters,
} from "@/types/filters";

function normalizeFilters(filters: LocationDateFilters): LocationDateFilters {
  return {
    city: filters.city.trim(),
    state: filters.state.trim().toUpperCase(),
    date: filters.date,
  };
}

export function useLocationDateFilters() {
  const [queryFilters, setQueryFilters] = useQueryStates(
    {
      city: parseAsString.withDefault(""),
      state: parseAsString.withDefault(""),
      date: parseAsString.withDefault(""),
    },
    {
      history: "replace",
      clearOnDefault: true,
    },
  );

  const normalizedQueryFilters = useMemo(
    () => normalizeFilters(queryFilters),
    [queryFilters],
  );

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
    void setQueryFilters(normalized);
    return normalized;
  };

  const clearFilters = () => {
    setFilters(EMPTY_LOCATION_DATE_FILTERS);
    setAppliedFilters(EMPTY_LOCATION_DATE_FILTERS);
    void setQueryFilters(EMPTY_LOCATION_DATE_FILTERS);
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
