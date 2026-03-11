import { useEffect, useMemo, useState } from "react";
import { parseAsBoolean, parseAsString, useQueryStates } from "nuqs";
import {
  EMPTY_LOCATION_DATE_FILTERS,
  RADIUS_FILTER_OPTIONS,
  type LocationDateFilters,
} from "@/types/filters";

function normalizeFilters(filters: LocationDateFilters): LocationDateFilters {
  const parsedRadius = Number(filters.radiusKm);
  const normalizedRadius = RADIUS_FILTER_OPTIONS.includes(parsedRadius as 20 | 40 | 60 | 100 | 200)
    ? parsedRadius
    : EMPTY_LOCATION_DATE_FILTERS.radiusKm;

  return {
    city: filters.city.trim(),
    state: filters.state.trim().toUpperCase(),
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    radiusKm: normalizedRadius,
    followingOnly: Boolean(filters.followingOnly),
  };
}

export function useLocationDateFilters() {
  const [queryFilters, setQueryFilters] = useQueryStates(
    {
      city: parseAsString.withDefault(""),
      state: parseAsString.withDefault(""),
      dateFrom: parseAsString.withDefault(""),
      dateTo: parseAsString.withDefault(""),
      radiusKm: parseAsString.withDefault("100"),
      followingOnly: parseAsBoolean.withDefault(false),
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
      dateFrom: queryFilters.dateFrom,
      dateTo: queryFilters.dateTo,
      radiusKm: Number(queryFilters.radiusKm),
      followingOnly: queryFilters.followingOnly,
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
      dateFrom: normalized.dateFrom,
      dateTo: normalized.dateTo,
      radiusKm: String(normalized.radiusKm),
      followingOnly: normalized.followingOnly,
    });
    return normalized;
  };

  const clearFilters = () => {
    setFilters(EMPTY_LOCATION_DATE_FILTERS);
    setAppliedFilters(EMPTY_LOCATION_DATE_FILTERS);
    void setQueryFilters({
      city: EMPTY_LOCATION_DATE_FILTERS.city,
      state: EMPTY_LOCATION_DATE_FILTERS.state,
      dateFrom: EMPTY_LOCATION_DATE_FILTERS.dateFrom,
      dateTo: EMPTY_LOCATION_DATE_FILTERS.dateTo,
      radiusKm: String(EMPTY_LOCATION_DATE_FILTERS.radiusKm),
      followingOnly: EMPTY_LOCATION_DATE_FILTERS.followingOnly,
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
