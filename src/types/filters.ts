export type LocationDateFilters = {
  city: string;
  state: string;
  date: string;
  radiusKm: number;
  followingOnly: boolean;
};

export const RADIUS_FILTER_OPTIONS = [20, 40, 60, 100, 200] as const;

export type RadiusFilterOption = (typeof RADIUS_FILTER_OPTIONS)[number];

export const EMPTY_LOCATION_DATE_FILTERS: LocationDateFilters = {
  city: "",
  state: "",
  date: "",
  radiusKm: 100,
  followingOnly: false,
};
