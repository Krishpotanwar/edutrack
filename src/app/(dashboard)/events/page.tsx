'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, X } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EventCard } from '@/components/events';
import { EmptyState, SkeletonEventCard } from '@/components/glass';
import { cn } from '@/lib/utils';
import type { Event, EventStatus, EventCategory } from '@/types';

const statusFilters: { value: EventStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'planned', label: 'Planned' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
];

const categoryFilters: { value: EventCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'outreach', label: 'Outreach' },
  { value: 'training', label: 'Training' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'other', label: 'Other' },
];

async function fetchEvents(params: { status?: string; category?: string; search?: string }) {
  const searchParams = new URLSearchParams();
  if (params.status && params.status !== 'all') searchParams.set('status', params.status);
  if (params.category && params.category !== 'all') searchParams.set('category', params.category);
  if (params.search) searchParams.set('search', params.search);
  
  const response = await fetch(`/api/events?${searchParams.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch events');
  return response.json();
}

export default function EventsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<EventCategory | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['events', statusFilter, categoryFilter, search],
    queryFn: () => fetchEvents({ status: statusFilter, category: categoryFilter, search }),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const events: Event[] = data?.data || [];

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (statusFilter !== 'all') count++;
    if (categoryFilter !== 'all') count++;
    return count;
  }, [statusFilter, categoryFilter]);

  const clearFilters = () => {
    setStatusFilter('all');
    setCategoryFilter('all');
    setSearch('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Events</h1>
          <p className="text-muted-foreground">Manage and browse all events</p>
        </div>
        <Link href="/events/create">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
          <Button
            variant="outline"
            className="h-12 relative"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </div>

        {/* Filter pills - Status */}
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-colors tap-target',
                statusFilter === filter.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-accent'
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="glass-card p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Category</h3>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear all
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {categoryFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setCategoryFilter(filter.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm transition-colors',
                    categoryFilter === filter.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background border hover:bg-accent'
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonEventCard />
          <SkeletonEventCard />
          <SkeletonEventCard />
          <SkeletonEventCard />
          <SkeletonEventCard />
          <SkeletonEventCard />
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          title="No events found"
          description="Try adjusting your filters or create a new event"
          action={{
            label: 'Create Event',
            onClick: () => window.location.href = '/events/create',
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
