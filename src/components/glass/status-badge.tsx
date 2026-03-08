'use client';

import { cn } from '@/lib/utils';
import type { EventStatus } from '@/types';

interface StatusBadgeProps {
  status: EventStatus;
  className?: string;
}

const statusConfig: Record<EventStatus, { label: string; className: string }> = {
  completed: {
    label: 'Completed',
    className: 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30',
  },
  ongoing: {
    label: 'Ongoing',
    className: 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30',
  },
  planned: {
    label: 'Planned',
    className: 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
