import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useNotificationsQuery,
} from "@/hooks/queries/useNotificationsQueries";
import {
  useMarkNotificationReadMutation,
} from "@/hooks/queries/useNotificationsMutations";
import { Bell, BellOff, CheckCheck } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Notification } from "@/types/notifications";

const formatDate = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

function NotificationItem({
  notification,
  onMarkRead,
  isLoading,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
  isLoading: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-2xl border p-4 transition-colors",
        notification.isRead
          ? "border-gray-200 bg-gray-50"
          : "border-primary/20 bg-primary/5",
      )}
    >
      <div
        className={cn(
          "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border",
          notification.isRead
            ? "border-gray-200 bg-white text-gray-400"
            : "border-primary/20 bg-primary/10 text-primary",
        )}
      >
        <Bell className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <p
          className={cn(
            "text-sm font-semibold",
            notification.isRead ? "text-gray-600" : "text-gray-900",
          )}
        >
          {notification.title}
        </p>
        <p
          className={cn(
            "text-sm",
            notification.isRead ? "text-gray-500" : "text-gray-700",
          )}
        >
          {notification.body}
        </p>
        <p className="text-xs text-gray-400">
          {formatDate.format(new Date(notification.createdAt))}
        </p>
      </div>

      {!notification.isRead && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isLoading}
          onClick={() => {
            onMarkRead(notification.id);
          }}
          className="shrink-0"
          aria-label="Marcar como lida"
        >
          <CheckCheck className="h-4 w-4" />
          <span className="sr-only">Marcar como lida</span>
        </Button>
      )}
    </div>
  );
}

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const notificationsQuery = useNotificationsQuery(page);
  const markReadMutation = useMarkNotificationReadMutation();

  const notifications = notificationsQuery.data?.items ?? [];
  const pagination = notificationsQuery.data?.pagination;
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkRead = (id: string) => {
    markReadMutation.mutate(id);
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-3xl border border-primary/20 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-primary">Notificações</h1>
              <p className="mt-1 text-sm text-gray-600">
                {unreadCount > 0
                  ? `${unreadCount} notificação${unreadCount > 1 ? "ões" : ""} não lida${unreadCount > 1 ? "s" : ""}`
                  : "Todas as notificações lidas"}
              </p>
            </div>
          </div>
        </div>

        {notificationsQuery.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="flex items-start gap-3 rounded-2xl border border-gray-200 p-4"
              >
                <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : notificationsQuery.isError ? (
          <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-red-800">
            <p>Não foi possível carregar as notificações. Tente novamente.</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <BellOff className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p className="font-semibold text-gray-700">Nenhuma notificação</p>
            <p className="mt-1 text-sm text-gray-500">
              Você não possui notificações no momento.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkRead={handleMarkRead}
                isLoading={
                  markReadMutation.isPending &&
                  markReadMutation.variables === notification.id
                }
              />
            ))}

            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || notificationsQuery.isFetching}
                  onClick={() => {
                    setPage((prev) => Math.max(1, prev - 1));
                  }}
                >
                  Anterior
                </Button>
                <span className="text-sm text-gray-600">
                  Página {pagination.page} de {pagination.totalPages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.totalPages || notificationsQuery.isFetching}
                  onClick={() => {
                    setPage((prev) => prev + 1);
                  }}
                >
                  Próxima
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
