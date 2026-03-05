export type Team = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  city?: string | null;
  state?: string | null;
  logoUrl?: string | null;
  createdBy?: string | null;
  followersCount?: number | null;
  createdAt?: string | null;
};

export type CreateTeamPayload = {
  name: string;
  description?: string;
  city?: string;
  state?: string;
  logoUrl?: string;
};
