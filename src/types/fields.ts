export type FieldPhoto = {
  id: string;
  photoUrl: string;
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
