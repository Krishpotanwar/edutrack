'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Edit2,
  Trash2,
  Share2,
  UserPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GlassCard, StatusBadge, SkeletonCard } from '@/components/glass';
import { useAuthStore } from '@/stores/auth-store';
import type { Event, User } from '@/types';

async function fetchEvent(id: string): Promise<Event> {
  const response = await fetch(`/api/events/${id}`);
  if (!response.ok) throw new Error('Event not found');
  return response.json();
}

async function fetchUsers(): Promise<{ data: User[] }> {
  const response = await fetch('/api/users');
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
}

async function joinEvent(id: string) {
  const response = await fetch(`/api/events/${id}/join`, { method: 'POST' });
  if (!response.ok) throw new Error('Failed to join event');
  return response.json();
}

async function deleteEvent(id: string) {
  const response = await fetch(`/api/events/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to delete event');
  return response.json();
}

const categoryColors: Record<string, string> = {
  workshop: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
  seminar: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  outreach: 'bg-green-500/10 text-green-700 dark:text-green-400',
  training: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  meeting: 'bg-slate-500/10 text-slate-700 dark:text-slate-400',
  other: 'bg-gray-500/10 text-gray-700 dark:text-gray-400',
};

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();
  const eventId = params.id as string;

  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => fetchEvent(eventId),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const users = usersData?.data || [];

  const joinMutation = useMutation({
    mutationFn: () => joinEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Successfully joined the event!');
    },
    onError: () => {
      toast.error('Failed to join event');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event deleted');
      router.push('/events');
    },
    onError: () => {
      toast.error('Failed to delete event');
    },
  });

  const attendees = event?.attendees
    .map((id) => users.find((u) => u.id === id))
    .filter(Boolean) as User[] || [];

  const isAttending = event?.attendees.includes(currentUser?.id || '');
  const isCreator = event?.createdBy === currentUser?.id;
  const canEdit = isCreator || currentUser?.role === 'admin';

  const handleExportToCalendar = () => {
    if (!event) return;
    
    const startDate = new Date(event.startDate).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDate = new Date(event.endDate).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;
    
    window.open(googleCalendarUrl, '_blank');
  };

  if (eventLoading) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Event not found</p>
        <Link href="/events">
          <Button className="mt-4">Back to Events</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/events">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold">{event.title}</h1>
            <StatusBadge status={event.status} />
          </div>
          <span
            className={`inline-block mt-1 text-xs px-2 py-1 rounded-full capitalize ${categoryColors[event.category]}`}
          >
            {event.category}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {!isAttending && event.status !== 'completed' && (
          <Button onClick={() => joinMutation.mutate()} disabled={joinMutation.isPending}>
            <UserPlus className="h-4 w-4 mr-2" />
            Join Event
          </Button>
        )}
        {canEdit && (
          <Link href={`/events/${eventId}/edit`}>
            <Button variant="outline">
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
        )}
        <Button variant="outline" onClick={handleExportToCalendar}>
          <Share2 className="h-4 w-4 mr-2" />
          Export to Calendar
        </Button>
        {canEdit && (
          <Button
            variant="outline"
            className="text-destructive hover:text-destructive"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <GlassCard>
            <h2 className="font-semibold mb-3">Description</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {event.description}
            </p>
          </GlassCard>

          {/* Photos */}
          {event.photos.length > 0 && (
            <GlassCard>
              <h2 className="font-semibold mb-3">Photos</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {event.photos.map((photo, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-lg bg-muted overflow-hidden"
                  >
                    <Image
                      src={photo}
                      alt={`Event photo ${index + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>

        {/* Right Column - Info */}
        <div className="space-y-6">
          {/* Event Details */}
          <GlassCard>
            <h2 className="font-semibold mb-4">Event Details</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">
                    {format(new Date(event.startDate), 'EEEE, MMMM d, yyyy')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(event.startDate), 'h:mm a')} -{' '}
                    {format(new Date(event.endDate), 'h:mm a')}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">{event.location}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">
                    {event.attendees.length} attending
                    {event.maxParticipants && ` / ${event.maxParticipants} max`}
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Attendees */}
          <GlassCard>
            <h2 className="font-semibold mb-4">Attendees ({attendees.length})</h2>
            <div className="space-y-3">
              {attendees.length === 0 ? (
                <p className="text-sm text-muted-foreground">No attendees yet</p>
              ) : (
                attendees.slice(0, 10).map((attendee) => (
                  <div key={attendee.id} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={attendee.avatar} alt={attendee.name} />
                      <AvatarFallback>
                        {attendee.name.split(' ').map((n) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{attendee.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {attendee.role}
                      </p>
                    </div>
                  </div>
                ))
              )}
              {attendees.length > 10 && (
                <p className="text-sm text-muted-foreground">
                  +{attendees.length - 10} more
                </p>
              )}
            </div>
          </GlassCard>

          {/* Tags */}
          {event.tags.length > 0 && (
            <GlassCard>
              <h2 className="font-semibold mb-3">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs rounded-full bg-muted"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
