'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/glass';
import { Calendar, MapPin, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Event } from '@/types';

interface EventCardProps {
  event: Event;
  className?: string;
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  workshop: { bg: 'bg-purple-500/10', text: 'text-purple-700 dark:text-purple-400' },
  seminar: { bg: 'bg-blue-500/10', text: 'text-blue-700 dark:text-blue-400' },
  outreach: { bg: 'bg-green-500/10', text: 'text-green-700 dark:text-green-400' },
  training: { bg: 'bg-amber-500/10', text: 'text-amber-700 dark:text-amber-400' },
  meeting: { bg: 'bg-slate-500/10', text: 'text-slate-700 dark:text-slate-400' },
  other: { bg: 'bg-gray-500/10', text: 'text-gray-700 dark:text-gray-400' },
};

export function EventCard({ event, className }: EventCardProps) {
  const categoryStyle = categoryColors[event.category] || categoryColors.other;

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Link
        href={`/events/${event.id}`}
        className={cn(
          'block glass-card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
          className
        )}
      >
        {/* Image area */}
        <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent opacity-50" />
          <Calendar className="h-12 w-12 text-primary/40" />
        </div>

        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold line-clamp-1">{event.title}</h3>
            <StatusBadge status={event.status} className="shrink-0" />
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {event.description}
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(event.startDate), 'MMM d, yyyy')}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="truncate max-w-24">{event.location}</span>
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {event.attendees.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={cn(
                'text-xs px-2 py-1 rounded-full capitalize',
                categoryStyle.bg,
                categoryStyle.text
              )}
            >
              {event.category}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
