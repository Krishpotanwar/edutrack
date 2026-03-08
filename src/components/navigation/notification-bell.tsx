'use client';

import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotificationStore } from '@/stores/notification-store';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function NotificationBell() {
  const { unreadCount, toggleDrawer } = useNotificationStore();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative tap-target"
      onClick={toggleDrawer}
      aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
    >
      <Bell className="h-5 w-5" />
      <AnimatePresence>
        {unreadCount > 0 && (
          <motion.span
            className={cn(
              'absolute -top-1 -right-1 flex items-center justify-center',
              'min-w-5 h-5 px-1.5 text-xs font-bold rounded-full',
              'bg-destructive text-destructive-foreground'
            )}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  );
}
