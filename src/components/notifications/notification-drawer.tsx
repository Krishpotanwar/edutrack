'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useNotificationStore } from '@/stores/notification-store';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Calendar, Check, CheckCheck, Trash2 } from 'lucide-react';
import Link from 'next/link';
import type { Notification, NotificationType } from '@/types';

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  event_reminder: <Calendar className="h-4 w-4" />,
  event_update: <Calendar className="h-4 w-4" />,
  assignment: <Bell className="h-4 w-4" />,
  system: <Bell className="h-4 w-4" />,
};

function NotificationItem({ notification }: { notification: Notification }) {
  const { markAsRead } = useNotificationStore();

  return (
    <div
      className={cn(
        'p-4 border-b border-border/50 transition-colors',
        !notification.isRead && 'bg-primary/5'
      )}
    >
      <div className="flex gap-3">
        <div
          className={cn(
            'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
            notification.isRead ? 'bg-muted' : 'bg-primary/20 text-primary'
          )}
        >
          {notificationIcons[notification.type]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium text-sm">{notification.title}</p>
            {!notification.isRead && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => markAsRead(notification.id)}
              >
                <Check className="h-3 w-3" />
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </p>
          {notification.eventId && (
            <Link
              href={`/events/${notification.eventId}`}
              className="text-xs text-primary hover:underline mt-1 inline-block"
            >
              View event →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export function NotificationDrawer() {
  const { notifications, isDrawerOpen, closeDrawer, markAllAsRead, clearAll, unreadCount } =
    useNotificationStore();

  return (
    <Sheet open={isDrawerOpen} onOpenChange={(open) => !open && closeDrawer()}>
      <SheetContent className="w-full sm:max-w-md p-0">
        <SheetHeader className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <SheetTitle>Notifications</SheetTitle>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  <CheckCheck className="h-4 w-4 mr-1" />
                  Mark all read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAll}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </SheetHeader>
        <div className="overflow-y-auto max-h-[calc(100vh-120px)]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Bell className="h-12 w-12 mb-4" />
              <p>No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
