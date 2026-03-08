import { http, HttpResponse, delay } from 'msw';
import { mockUsers, mockEvents, mockNotifications, mockDashboardStats } from '../data';
import type { Event } from '@/types';

// Simulated current user (admin for demo purposes)
let currentUser = mockUsers[0];

export const handlers = [
  // Auth handlers
  http.post('/api/auth/login', async ({ request }) => {
    await delay(500);
    const body = await request.json() as { email: string; password: string };
    
    const user = mockUsers.find((u) => u.email === body.email);
    if (user && body.password === 'password123') {
      currentUser = user;
      return HttpResponse.json({
        user,
        token: 'mock-jwt-token-' + user.id,
      });
    }
    
    return HttpResponse.json(
      { message: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  http.post('/api/auth/register', async ({ request }) => {
    await delay(500);
    const body = await request.json() as { name: string; email: string; password: string };
    
    const newUser = {
      id: String(mockUsers.length + 1),
      email: body.email,
      name: body.name,
      role: 'volunteer' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockUsers.push(newUser);
    currentUser = newUser;
    
    return HttpResponse.json({
      user: newUser,
      token: 'mock-jwt-token-' + newUser.id,
    });
  }),

  http.post('/api/auth/google', async () => {
    await delay(500);
    currentUser = mockUsers[0];
    return HttpResponse.json({
      user: currentUser,
      token: 'mock-jwt-token-google',
    });
  }),

  // User handlers
  http.get('/api/users/me', async () => {
    await delay(200);
    return HttpResponse.json(currentUser);
  }),

  http.get('/api/users', async () => {
    await delay(300);
    return HttpResponse.json({
      data: mockUsers,
      total: mockUsers.length,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    });
  }),

  http.get('/api/users/:id', async ({ params }) => {
    await delay(200);
    const user = mockUsers.find((u) => u.id === params.id);
    if (!user) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 });
    }
    return HttpResponse.json(user);
  }),

  http.patch('/api/users/me', async ({ request }) => {
    await delay(300);
    const updates = (await request.json()) as Partial<typeof currentUser>;
    Object.assign(currentUser, updates, { updatedAt: new Date().toISOString() });
    return HttpResponse.json(currentUser);
  }),

  http.patch('/api/users/:id/suspend', async ({ params }) => {
    await delay(300);
    const user = mockUsers.find((u) => u.id === params.id);
    if (!user) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 });
    }
    user.suspended = !user.suspended;
    return HttpResponse.json(user);
  }),

  http.patch('/api/users/:id/role', async ({ params, request }) => {
    await delay(300);
    const body = await request.json() as { role: string };
    const userIndex = mockUsers.findIndex((u) => u.id === params.id);
    
    if (userIndex === -1) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 });
    }
    
    mockUsers[userIndex].role = body.role as 'admin' | 'coordinator' | 'volunteer';
    return HttpResponse.json(mockUsers[userIndex]);
  }),

  // Events handlers
  http.get('/api/events', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const category = url.searchParams.get('category');
    const search = url.searchParams.get('search');
    
    let filteredEvents = [...mockEvents];
    
    if (status && status !== 'all') {
      filteredEvents = filteredEvents.filter((e) => e.status === status);
    }
    if (category && category !== 'all') {
      filteredEvents = filteredEvents.filter((e) => e.category === category);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      filteredEvents = filteredEvents.filter(
        (e) =>
          e.title.toLowerCase().includes(searchLower) ||
          e.description.toLowerCase().includes(searchLower)
      );
    }
    
    return HttpResponse.json({
      data: filteredEvents,
      total: filteredEvents.length,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    });
  }),

  http.get('/api/events/:id', async ({ params }) => {
    await delay(200);
    const event = mockEvents.find((e) => e.id === params.id);
    if (!event) {
      return HttpResponse.json({ message: 'Event not found' }, { status: 404 });
    }
    return HttpResponse.json(event);
  }),

  http.post('/api/events', async ({ request }) => {
    await delay(400);
    const body = await request.json() as Partial<Event>;
    
    const newEvent: Event = {
      id: String(mockEvents.length + 1),
      title: body.title || 'Untitled Event',
      description: body.description || '',
      location: body.location || '',
      startDate: body.startDate || new Date().toISOString(),
      endDate: body.endDate || new Date().toISOString(),
      category: body.category || 'other',
      status: body.status || 'planned',
      tags: body.tags || [],
      maxParticipants: body.maxParticipants,
      isPublic: body.isPublic ?? true,
      photos: [],
      createdBy: currentUser.id,
      attendees: [currentUser.id],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockEvents.push(newEvent);
    return HttpResponse.json(newEvent, { status: 201 });
  }),

  http.put('/api/events/:id', async ({ params, request }) => {
    await delay(300);
    const body = await request.json() as Record<string, unknown>;
    const eventIndex = mockEvents.findIndex((e) => e.id === params.id);
    
    if (eventIndex === -1) {
      return HttpResponse.json({ message: 'Event not found' }, { status: 404 });
    }
    
    mockEvents[eventIndex] = {
      ...mockEvents[eventIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    };
    
    return HttpResponse.json(mockEvents[eventIndex]);
  }),

  http.delete('/api/events/:id', async ({ params }) => {
    await delay(300);
    const eventIndex = mockEvents.findIndex((e) => e.id === params.id);
    
    if (eventIndex === -1) {
      return HttpResponse.json({ message: 'Event not found' }, { status: 404 });
    }
    
    mockEvents.splice(eventIndex, 1);
    return HttpResponse.json({ success: true });
  }),

  http.post('/api/events/:id/join', async ({ params }) => {
    await delay(300);
    const eventIndex = mockEvents.findIndex((e) => e.id === params.id);
    
    if (eventIndex === -1) {
      return HttpResponse.json({ message: 'Event not found' }, { status: 404 });
    }
    
    if (!mockEvents[eventIndex].attendees.includes(currentUser.id)) {
      mockEvents[eventIndex].attendees.push(currentUser.id);
    }
    
    return HttpResponse.json(mockEvents[eventIndex]);
  }),

  // Dashboard handlers
  http.get('/api/dashboard/stats', async () => {
    await delay(200);
    return HttpResponse.json(mockDashboardStats);
  }),

  // Notification handlers
  http.get('/api/notifications', async () => {
    await delay(200);
    return HttpResponse.json(mockNotifications);
  }),

  http.patch('/api/notifications/:id/read', async ({ params }) => {
    await delay(100);
    const notificationIndex = mockNotifications.findIndex((n) => n.id === params.id);
    
    if (notificationIndex !== -1) {
      mockNotifications[notificationIndex].isRead = true;
    }
    
    return HttpResponse.json({ success: true });
  }),

  http.patch('/api/notifications/read-all', async () => {
    await delay(100);
    mockNotifications.forEach((n) => (n.isRead = true));
    return HttpResponse.json({ success: true });
  }),

  // Reports handlers
  http.get('/api/reports/overview', async () => {
    await delay(300);
    return HttpResponse.json({
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
    });
  }),
];
