'use client';

import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import type { View, CalendarProps } from 'react-big-calendar';
import { dateFnsLocalizer } from 'react-big-calendar';

const BigCalendar = dynamic(
  () => import('react-big-calendar').then(mod => ({ default: mod.Calendar })),
  { 
    ssr: false,
    loading: () => <div className="glass-card p-4 flex items-center justify-center" style={{ height: 'calc(100vh - 350px)', minHeight: 500 }}><p className="text-muted-foreground">Loading calendar...</p></div>
  }
) as React.ComponentType<CalendarProps<CalendarEvent, object>>;
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import type { Event as EventType } from '@/types';

import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { 'en-US': enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

const statusColors: Record<string, string> = {
  completed: '#22C55E',
  ongoing: '#F59E0B',
  planned: '#3B82F6',
};

async function fetchEvents() {
  const response = await fetch('/api/events');
  if (!response.ok) throw new Error('Failed to fetch events');
  return response.json();
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: string;
  resource: EventType;
}

export default function CalendarPage() {
  const router = useRouter();
  const [view, setView] = useState<View>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 'agenda';
    }
    return 'month';
  });
  const [date, setDate] = useState(new Date());
  const [myEventsOnly, setMyEventsOnly] = useState(false);

  const { data } = useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const events = useMemo(() => data?.data || [], [data?.data]);

  const calendarEvents: CalendarEvent[] = useMemo(() => {
    return events.map((event: EventType) => ({
      id: event.id,
      title: event.title,
      start: new Date(event.startDate),
      end: new Date(event.endDate),
      status: event.status,
      resource: event,
    }));
  }, [events]);

  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    return {
      style: {
        backgroundColor: statusColors[event.status] || '#3B82F6',
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        fontSize: '12px',
        padding: '2px 4px',
      },
    };
  }, []);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    router.push(`/events/${event.id}`);
  }, [router]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">View and manage your schedule</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="my-events"
              checked={myEventsOnly}
              onCheckedChange={setMyEventsOnly}
            />
            <Label htmlFor="my-events" className="text-sm">My Events</Label>
          </div>

          {/* View switcher */}
          <div className="flex rounded-lg bg-muted p-1">
            {(['month', 'week', 'agenda'] as View[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-colors capitalize',
                  view === v ? 'bg-background shadow' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: statusColors.completed }} />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: statusColors.ongoing }} />
          <span>Ongoing</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: statusColors.planned }} />
          <span>Planned</span>
        </div>
      </div>

      {/* Calendar */}
      <div className="glass-card p-4 overflow-hidden">
        <style jsx global>{`
          .rbc-calendar {
            font-family: inherit;
          }
          .rbc-header {
            padding: 8px;
            font-weight: 500;
          }
          .rbc-today {
            background-color: var(--accent);
          }
          .rbc-off-range-bg {
            background-color: var(--muted);
          }
          .rbc-event {
            background-color: var(--primary);
          }
          .rbc-toolbar button {
            color: var(--foreground);
          }
          .rbc-toolbar button:hover {
            background-color: var(--accent);
          }
          .rbc-toolbar button.rbc-active {
            background-color: var(--primary);
            color: var(--primary-foreground);
          }
          .rbc-month-view, .rbc-time-view, .rbc-agenda-view {
            border-color: var(--border);
          }
          .rbc-month-row + .rbc-month-row,
          .rbc-day-bg + .rbc-day-bg,
          .rbc-header + .rbc-header {
            border-color: var(--border);
          }
          .rbc-timeslot-group {
            border-color: var(--border);
          }
          .rbc-time-header-content {
            border-color: var(--border);
          }
          .rbc-agenda-table {
            border-color: var(--border);
          }
          .rbc-agenda-date-cell, .rbc-agenda-time-cell, .rbc-agenda-event-cell {
            padding: 12px;
          }
        `}</style>
        <BigCalendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 'calc(100vh - 350px)', minHeight: 500 }}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={handleSelectEvent}
          popup
          selectable
        />
      </div>
    </div>
  );
}
