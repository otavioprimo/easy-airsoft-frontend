export type LocationDateFilters = {
  city: string;
  state: string;
  date: string;
  radiusKm: number;
};

export const EMPTY_LOCATION_DATE_FILTERS: LocationDateFilters = {
  city: "",
  state: "",
  date: "",
  radiusKm: 100,
};
