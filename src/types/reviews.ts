export type CreateReviewPayload = {
  rating: number;
  comment?: string;
};

/** @deprecated Use CreateReviewPayload */
export type CreateFieldReviewPayload = CreateReviewPayload;

/** @deprecated Use CreateReviewPayload */
export type CreateGameReviewPayload = CreateReviewPayload;

export type Review = {
  id: string;
  rating: number;
  comment?: string | null;
  userId: string;
  createdAt: string;
};
