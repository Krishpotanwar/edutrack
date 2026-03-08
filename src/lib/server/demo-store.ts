import { mockDashboardStats, mockEvents, mockUsers } from '@/mocks/data';
import type {
  DashboardStats,
  Event,
  EventCategory,
  EventStatus,
  User,
  UserRole,
} from '@/types';

interface EventFilters {
  status?: EventStatus | 'all';
  category?: EventCategory | 'all';
  search?: string;
}

export interface ReportsOverview {
  eventsPerMonth: Array<{ name: string; value: number }>;
  eventsByStatus: Array<{ name: string; value: number; color: string }>;
  volunteerParticipation: Array<{ name: string; value: number }>;
}

const users: User[] = mockUsers.map((user) => ({ ...user }));

const events: Event[] = mockEvents.map((event) => ({
  ...event,
  tags: [...event.tags],
  photos: [...event.photos],
  attendees: [...event.attendees],
}));

let currentUserId: string | null = users[0]?.id ?? null;

const reportsOverview: ReportsOverview = {
  eventsPerMonth: [
    { name: 'Jan', value: 4 },
    { name: 'Feb', value: 6 },
    { name: 'Mar', value: 8 },
    { name: 'Apr', value: 5 },
    { name: 'May', value: 7 },
    { name: 'Jun', value: 9 },
  ],
  eventsByStatus: [
    { name: 'Completed', value: 18, color: '#22C55E' },
    { name: 'Ongoing', value: 3, color: '#F59E0B' },
    { name: 'Planned', value: 6, color: '#3B82F6' },
  ],
  volunteerParticipation: [
    { name: 'Jan', value: 25 },
    { name: 'Feb', value: 32 },
    { name: 'Mar', value: 45 },
    { name: 'Apr', value: 38 },
    { name: 'May', value: 48 },
    { name: 'Jun', value: 52 },
  ],
};

function getNextNumericId(items: Array<{ id: string }>): string {
  const maxId = items.reduce((max, item) => {
    const parsedId = Number.parseInt(item.id, 10);
    return Number.isNaN(parsedId) ? max : Math.max(max, parsedId);
  }, 0);

  return String(maxId + 1);
}

export function createDemoToken(value: string): string {
  return `mock-jwt-token-${value}`;
}

export function getUsers(): User[] {
  return users;
}

export function findUserByEmail(email: string): User | undefined {
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

export function getCurrentUser(): User | null {
  if (!currentUserId) {
    return null;
  }

  return users.find((user) => user.id === currentUserId) ?? null;
}

export function setCurrentUser(user: User): void {
  currentUserId = user.id;
}

export function createUser(input: {
  name: string;
  email: string;
  role?: UserRole;
}): User {
  const now = new Date().toISOString();
  const newUser: User = {
    id: getNextNumericId(users),
    email: input.email,
    name: input.name,
    role: input.role ?? 'volunteer',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(input.name.toLowerCase())}`,
    createdAt: now,
    updatedAt: now,
  };

  users.push(newUser);
  return newUser;
}

export function getEvents(filters: EventFilters = {}): Event[] {
  let filteredEvents = [...events];

  if (filters.status && filters.status !== 'all') {
    filteredEvents = filteredEvents.filter((event) => event.status === filters.status);
  }

  if (filters.category && filters.category !== 'all') {
    filteredEvents = filteredEvents.filter(
      (event) => event.category === filters.category
    );
  }

  if (filters.search?.trim()) {
    const normalizedSearch = filters.search.toLowerCase();
    filteredEvents = filteredEvents.filter(
      (event) =>
        event.title.toLowerCase().includes(normalizedSearch) ||
        event.description.toLowerCase().includes(normalizedSearch)
    );
  }

  return filteredEvents;
}

export function createEvent(input: Partial<Event>): Event {
  const currentUser = getCurrentUser();
  const now = new Date().toISOString();

  if (!currentUser) {
    throw new Error('No current user available');
  }

  const newEvent: Event = {
    id: getNextNumericId(events),
    title: input.title ?? 'Untitled Event',
    description: input.description ?? '',
    location: input.location ?? '',
    startDate: input.startDate ?? now,
    endDate: input.endDate ?? now,
    category: input.category ?? 'other',
    status: input.status ?? 'planned',
    tags: input.tags ?? [],
    photos: [],
    createdBy: currentUser.id,
    attendees: [currentUser.id],
    maxParticipants: input.maxParticipants,
    isPublic: input.isPublic ?? true,
    createdAt: now,
    updatedAt: now,
  };

  events.push(newEvent);
  return newEvent;
}

export function getDashboardStats(): DashboardStats {
  return mockDashboardStats;
}

export function getReportsOverview(): ReportsOverview {
  return reportsOverview;
}
