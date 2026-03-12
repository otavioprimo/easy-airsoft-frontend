export type FieldPhoto = {
  id: string;
  photoUrl: string;
};

export type FieldReview = {
  id: string;
  rating?: number | null;
  comment?: string | null;
  updatedAt?: string | null;
  user?: {
    id: string;
    name: string;
    username?: string | null;
    profilePhoto?: string | null;
  } | null;
};

export type Field = {
  id: string;
  teamId?: string | null;
  name: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  photos?: FieldPhoto[];
  rating?: {
    avg: number;
    count: number;
  };
  reviews?: FieldReview[];
};

export type CreateFieldPayload = {
  teamId: string;
  name: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  photos?: string[];
};

export type UpdateFieldPayload = {
  name?: string;
  city?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  photos?: string[];
};
