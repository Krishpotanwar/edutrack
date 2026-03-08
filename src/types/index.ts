// User types
export type UserRole = 'admin' | 'coordinator' | 'volunteer';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  department?: string;
  bio?: string;
  phone?: string;
  suspended?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Event types
export type EventStatus = 'planned' | 'ongoing' | 'completed';
export type EventCategory = 'workshop' | 'seminar' | 'outreach' | 'training' | 'meeting' | 'other';

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  category: EventCategory;
  status: EventStatus;
  tags: string[];
  photos: string[];
  createdBy: string;
  attendees: string[];
  maxParticipants?: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EventFormData {
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  category: EventCategory;
  status: EventStatus;
  tags: string[];
  maxParticipants?: number;
  isPublic: boolean;
}

// Notification types
export type NotificationType = 'event_reminder' | 'event_update' | 'assignment' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  eventId?: string;
  isRead: boolean;
  createdAt: string;
}

// Auth types
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  confirmPassword: string;
}

// Dashboard types
export interface DashboardStats {
  totalEvents: number;
  activeVolunteers: number;
  completedEvents: number;
  upcomingEvents: number;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Filter types
export interface EventFilters {
  status?: EventStatus | 'all';
  category?: EventCategory | 'all';
  search?: string;
  startDate?: string;
  endDate?: string;
}
