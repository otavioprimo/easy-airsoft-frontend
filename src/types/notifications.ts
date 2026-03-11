export type Notification = {
  id: string;
  userId: string;
  type: string;
  title: string;
  description: string;
  isRead: boolean;
  referenceId?: string | null;
  reference?: {
    game?: {
      id: string;
      title: string;
      datetime?: string | null;
      city?: string | null;
      state?: string | null;
    } | null;
    team?: {
      id: string;
      name: string;
      logoUrl?: string | null;
      city?: string | null;
      state?: string | null;
    } | null;
  } | null;
  createdAt: string;
};

export type UnreadNotificationsCountResponse = {
  unreadCount: number;
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
