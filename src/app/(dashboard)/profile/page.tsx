'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GlassCard, SkeletonCard } from '@/components/glass';
import { EventCard } from '@/components/events';
import { CalendarDays, ImageIcon, Mail, Phone, Building, Edit2, Save, X } from 'lucide-react';
import type { User, Event } from '@/types';

async function fetchCurrentUser(): Promise<User> {
  const response = await fetch('/api/users/me');
  if (!response.ok) throw new Error('Failed to fetch user');
  return response.json();
}

async function fetchEvents(): Promise<{ data: Event[] }> {
  const response = await fetch('/api/events');
  if (!response.ok) throw new Error('Failed to fetch events');
  return response.json();
}

async function updateProfile(data: Partial<User>): Promise<User> {
  const response = await fetch('/api/users/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update profile');
  return response.json();
}

const DEPARTMENTS = ['Management', 'Programs', 'Outreach', 'Education', 'Operations', 'Finance'];

const NOTIFICATION_PREFS_KEY = 'edutrack-notification-prefs';

interface NotificationPrefs {
  emailNotifications: boolean;
  pushNotifications: boolean;
  eventReminders: boolean;
}

function useNotificationPrefs() {
  const [prefs, setPrefs] = useState<NotificationPrefs>({
    emailNotifications: true,
    pushNotifications: true,
    eventReminders: true,
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(NOTIFICATION_PREFS_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Sync initial value from localStorage
      if (stored) setPrefs(JSON.parse(stored));
    } catch {
      // use defaults
    }
  }, []);

  const updatePref = useCallback(
    (key: keyof NotificationPrefs, value: boolean) => {
      setPrefs((prev) => {
        const next = { ...prev, [key]: value };
        localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(next));
        toast.success(`${key === 'emailNotifications' ? 'Email notifications' : key === 'pushNotifications' ? 'Push notifications' : 'Event reminders'} ${value ? 'enabled' : 'disabled'}`);
        return next;
      });
    },
    []
  );

  return { prefs, updatePref };
}

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', bio: '', department: '' });

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: fetchCurrentUser,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const profileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
      toast.success('Profile updated successfully');
      setEditing(false);
    },
    onError: () => {
      toast.error('Failed to update profile');
    },
  });

  const { prefs, updatePref } = useNotificationPrefs();

  const events = eventsData?.data || [];
  const userEvents = events.filter((e) => e.attendees.includes(user?.id || ''));

  const roleColors: Record<string, string> = {
    admin: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
    coordinator: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
    volunteer: 'bg-green-500/10 text-green-700 dark:text-green-400',
  };

  const handleStartEditing = () => {
    if (user) {
      setEditForm({
        name: user.name,
        bio: user.bio || '',
        department: user.department || '',
      });
      setEditing(true);
    }
  };

  const handleSave = () => {
    if (!editForm.name.trim()) {
      toast.error('Name is required');
      return;
    }
    profileMutation.mutate({
      name: editForm.name.trim(),
      bio: editForm.bio.trim() || undefined,
      department: editForm.department || undefined,
    });
  };

  const handleCancel = () => {
    setEditing(false);
  };

  if (userLoading) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <GlassCard className="relative overflow-hidden">
        <div className="absolute inset-0 h-24 bg-gradient-to-r from-primary/20 to-primary/5" />
        <AnimatePresence mode="wait">
          {editing ? (
            <motion.div
              key="edit-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="relative pt-12"
            >
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-2xl">
                    {user.name.split(' ').map((n) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-semibold">Edit Profile</h2>
              </div>

              <div className="space-y-4 max-w-lg">
                <div>
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={editForm.name}
                    onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-bio">Bio</Label>
                  <Textarea
                    id="edit-bio"
                    value={editForm.bio}
                    onChange={(e) => setEditForm((f) => ({ ...f, bio: e.target.value }))}
                    placeholder="Tell us about yourself..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-department">Department</Label>
                  <Select
                    value={editForm.department}
                    onValueChange={(value) => setEditForm((f) => ({ ...f, department: value ?? '' }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button onClick={handleSave} disabled={profileMutation.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    {profileMutation.isPending ? 'Saving...' : 'Save'}
                  </Button>
                  <Button variant="outline" onClick={handleCancel} disabled={profileMutation.isPending}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="view-mode"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <div className="relative pt-12 flex flex-col sm:flex-row items-center sm:items-end gap-4">
                <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-2xl">
                    {user.name.split(' ').map((n) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center sm:text-left pb-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <h1 className="text-2xl font-bold">{user.name}</h1>
                    <Badge className={roleColors[user.role]} variant="secondary">
                      {user.role}
                    </Badge>
                  </div>
                  {user.bio && (
                    <p className="text-muted-foreground mt-1 max-w-lg">{user.bio}</p>
                  )}
                </div>
                <Button variant="outline" className="shrink-0" onClick={handleStartEditing}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>

              {/* Contact Info */}
              <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </span>
                {user.phone && (
                  <span className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {user.phone}
                  </span>
                )}
                {user.department && (
                  <span className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    {user.department}
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard className="text-center">
          <CalendarDays className="h-8 w-8 mx-auto text-primary mb-2" />
          <p className="text-2xl font-bold">{userEvents.length}</p>
          <p className="text-sm text-muted-foreground">Events Joined</p>
        </GlassCard>
        <GlassCard className="text-center">
          <CalendarDays className="h-8 w-8 mx-auto text-primary mb-2" />
          <p className="text-2xl font-bold">
            {events.filter((e) => e.createdBy === user.id).length}
          </p>
          <p className="text-sm text-muted-foreground">Events Created</p>
        </GlassCard>
        <GlassCard className="text-center">
          <ImageIcon className="h-8 w-8 mx-auto text-primary mb-2" />
          <p className="text-2xl font-bold">{events.reduce((total, e) => total + (e.photos?.length || 0), 0)}</p>
          <p className="text-sm text-muted-foreground">Photos Uploaded</p>
        </GlassCard>
        <GlassCard className="text-center">
          <CalendarDays className="h-8 w-8 mx-auto text-primary mb-2" />
          <p className="text-2xl font-bold">{events.filter((e) => e.status === 'completed' && e.attendees.includes(user.id)).length * 4}</p>
          <p className="text-sm text-muted-foreground">Hours Volunteered</p>
        </GlassCard>
      </div>

      {/* My Events */}
      <div>
        <h2 className="text-xl font-semibold mb-4">My Events</h2>
        {eventsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : userEvents.length === 0 ? (
          <GlassCard className="text-center py-8 text-muted-foreground">
            No events joined yet
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userEvents.slice(0, 6).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>

      {/* Notification Preferences */}
      <GlassCard>
        <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive event reminders and updates via email
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={prefs.emailNotifications}
              onCheckedChange={(val) => updatePref('emailNotifications', val)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="push-notifications">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications in browser
              </p>
            </div>
            <Switch
              id="push-notifications"
              checked={prefs.pushNotifications}
              onCheckedChange={(val) => updatePref('pushNotifications', val)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="event-reminders">Event Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Get reminded 24 hours before events
              </p>
            </div>
            <Switch
              id="event-reminders"
              checked={prefs.eventReminders}
              onCheckedChange={(val) => updatePref('eventReminders', val)}
            />
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
