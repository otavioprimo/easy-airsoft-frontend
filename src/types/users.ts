export type UserProfile = {
  id: string;
  username?: string | null;
  email?: string | null;
  name: string;
  bio?: string | null;
  city?: string | null;
  state?: string | null;
  profilePhoto?: string | null;
  createdAt?: string | null;
};

export type PublicUserProfile = UserProfile & {
  teamMemberships?: Array<{
    role: string;
    team: {
      id: string;
      name: string;
      logoUrl?: string | null;
      city?: string | null;
      state?: string | null;
    };
  }>;
  _count?: {
    gameParticipations?: number;
    followingTeams?: number;
  };
};

export type PublicProfileGameItem = {
  id: string;
  title: string;
  datetime: string;
  city?: string | null;
  state?: string | null;
  team?: {
    id: string;
    name: string;
  } | null;
  field?: {
    id: string;
    name: string;
    city?: string | null;
    state?: string | null;
  } | null;
};

export type PublicProfileTeamItem = {
  id: string;
  name: string;
  logoUrl?: string | null;
  city?: string | null;
  state?: string | null;
};

export type PublicProfileMembershipItem = {
  role: string;
  team: PublicProfileTeamItem;
};

export type PaginatedListResponse<T> = {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type UpdateUserProfilePayload = {
  name?: string;
  bio?: string;
  city?: string;
  state?: string;
  profilePhoto?: string;
};
