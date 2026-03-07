export type ParticipationStatus = "CONFIRMED" | "INTERESTED" | "CANCELLED";

export type Filters = {
  city: string;
  state: string;
  date: string;
};

export type GameItem = {
  id: string;
  title: string;
  description?: string | null;
  datetime: string;
  maxPlayers: number;
  confirmedCount?: number | null;
  interestedCount?: number | null;
  price?: number | string | null;
  city?: string | null;
  state?: string | null;
  status?: string | null;
  myParticipationStatus?: ParticipationStatus | null;
  team?: {
    id: string;
    name: string;
  } | null;
  field?: {
    id: string;
    name: string;
    city?: string | null;
    state?: string | null;
    latitude?: number | string | null;
    longitude?: number | string | null;
  } | null;
};

export type ListGamesResponse = {
  items: GameItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type CreateGamePayload = {
  teamId: string;
  fieldId: string;
  title: string;
  description?: string;
  datetime: string;
  maxPlayers: number;
  price?: number;
  externalTicketUrl?: string;
};
