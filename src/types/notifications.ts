export type Notification = {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  data?: Record<string, unknown> | null;
  createdAt: string;
};

export type ListNotificationsResponse = {
  items: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
