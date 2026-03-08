'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { PhotoUploader } from '@/components/ui/photo-uploader';
import { TagsInput } from '@/components/ui/tags-input';
import { GlassCard, Skeleton } from '@/components/glass';
import { eventSchema, type EventFormData } from '@/lib/validations';
import type { Event } from '@/types';
import Link from 'next/link';

async function fetchEvent(id: string): Promise<Event> {
  const response = await fetch(`/api/events/${id}`);
  if (!response.ok) throw new Error('Failed to fetch event');
  return response.json();
}

async function updateEvent(id: string, data: EventFormData) {
  const response = await fetch(`/api/events/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update event');
  return response.json();
}

function formatDateForInput(dateString: string): string {
  const date = new Date(dateString);
  return date.toISOString().slice(0, 16);
}

export default function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', resolvedParams.id],
    queryFn: () => fetchEvent(resolvedParams.id),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    values: event
      ? {
          title: event.title,
          description: event.description,
          location: event.location,
          startDate: formatDateForInput(event.startDate),
          endDate: formatDateForInput(event.endDate),
          category: event.category,
          status: event.status,
          tags: event.tags,
          photos: event.photos || [],
          maxParticipants: event.maxParticipants,
          isPublic: event.isPublic ?? true,
        }
      : undefined,
  });

  // eslint-disable-next-line react-hooks/incompatible-library -- React Hook Form watch() is intentionally non-memoizable
  const isPublic = watch('isPublic');
  const category = watch('category');
  const status = watch('status');

  const mutation = useMutation({
    mutationFn: (data: EventFormData) => updateEvent(resolvedParams.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', resolvedParams.id] });
      toast.success('Event updated successfully!');
      router.push(`/events/${resolvedParams.id}`);
    },
    onError: () => {
      toast.error('Failed to update event');
    },
  });

  const onSubmit = (data: EventFormData) => {
    mutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <GlassCard>
          <div className="space-y-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Event not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/events/${resolvedParams.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit Event</h1>
          <p className="text-muted-foreground">Update the details for this event</p>
        </div>
      </div>

      {/* Form */}
      <GlassCard>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              placeholder="Enter event title"
              {...register('title')}
              className="h-12"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe your event..."
              rows={4}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              placeholder="Event location"
              {...register('location')}
              className="h-12"
            />
            {errors.location && (
              <p className="text-sm text-destructive">{errors.location.message}</p>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="datetime-local"
                {...register('startDate')}
                className="h-12"
              />
              {errors.startDate && (
                <p className="text-sm text-destructive">{errors.startDate.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="datetime-local"
                {...register('endDate')}
                className="h-12"
              />
              {errors.endDate && (
                <p className="text-sm text-destructive">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          {/* Category and Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={category}
                onValueChange={(value) => {
                  if (value) setValue('category', value as EventFormData['category']);
                }}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="seminar">Seminar</SelectItem>
                  <SelectItem value="outreach">Outreach</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status *</Label>
              <Select
                value={status}
                onValueChange={(value) => {
                  if (value) setValue('status', value as EventFormData['status']);
                }}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Max Participants */}
          <div className="space-y-2">
            <Label htmlFor="maxParticipants">Max Participants (optional)</Label>
            <Input
              id="maxParticipants"
              type="number"
              placeholder="Leave empty for unlimited"
              {...register('maxParticipants', { valueAsNumber: true })}
              className="h-12"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <TagsInput
              tags={watch('tags') || []}
              onChange={(tags) => setValue('tags', tags)}
              placeholder="Type a tag and press Enter..."
            />
            <p className="text-xs text-muted-foreground">Press Enter or comma to add tags</p>
          </div>

          {/* Photos */}
          <div className="space-y-2">
            <Label>Photos</Label>
            <PhotoUploader
              photos={watch('photos') || []}
              onChange={(photos) => setValue('photos', photos)}
              maxPhotos={5}
            />
          </div>

          {/* Public Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="isPublic">Public Event</Label>
              <p className="text-sm text-muted-foreground">
                Public events are visible to everyone
              </p>
            </div>
            <Switch
              id="isPublic"
              checked={isPublic}
              onCheckedChange={(checked) => setValue('isPublic', checked)}
            />
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-4">
            <Link href={`/events/${resolvedParams.id}`} className="flex-1">
              <Button type="button" variant="outline" className="w-full h-12">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              className="flex-1 h-12"
              disabled={mutation.isPending}
            >
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Event
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
