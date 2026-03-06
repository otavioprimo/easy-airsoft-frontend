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

export type UpdateUserProfilePayload = {
  name?: string;
  bio?: string;
  city?: string;
  state?: string;
  profilePhoto?: string;
};
