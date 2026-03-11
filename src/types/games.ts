export type ParticipationStatus = "CONFIRMED" | "INTERESTED" | "CANCELLED";

export type Filters = {
  city: string;
  state: string;
  dateFrom: string;
  dateTo: string;
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
  externalTicketUrl?: string | null;
  city?: string | null;
  state?: string | null;
  status?: string | null;
  myParticipationStatus?: ParticipationStatus | null;
  participants?: Array<{
    id: string;
    status: ParticipationStatus;
    user?: {
      id: string;
      name: string;
      username?: string | null;
      profilePhoto?: string | null;
    } | null;
  }>;
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
    photos?: Array<{
      id: string;
      photoUrl: string;
    }>;
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
  maxPlayers?: number;
  price?: number;
  externalTicketUrl?: string;
};

export type GameStatus = "ACTIVE" | "CANCELLED" | "FINISHED";

export type UpdateGamePayload = {
  fieldId?: string;
  title?: string;
  description?: string;
  datetime?: string;
  maxPlayers?: number;
  price?: number;
  externalTicketUrl?: string;
  status?: GameStatus;
};
