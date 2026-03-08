'use client';

import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/glass';
import { Clock, MapPin } from 'lucide-react';
import Link from 'next/link';
import type { Event } from '@/types';

interface TodayEventsProps {
  events: Event[];
  className?: string;
}

export function TodayEvents({ events, className }: TodayEventsProps) {
  return (
    <div className={cn('glass-card p-4', className)}>
      <h3 className="font-semibold mb-4">Today&apos;s Events</h3>
      
      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No events scheduled for today
        </p>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.id}`}
              className="block p-3 rounded-lg bg-background/50 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-medium text-sm line-clamp-1">{event.title}</h4>
                <StatusBadge status={event.status} className="shrink-0" />
              </div>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {format(new Date(event.startDate), 'h:mm a')}
                </span>
                <span className="flex items-center gap-1 truncate">
                  <MapPin className="h-3 w-3" />
                  {event.location}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
