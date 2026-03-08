import { NextResponse } from 'next/server';
import {
  createEvent,
  getCurrentUser,
  getEvents,
} from '@/lib/server/demo-store';
import type { Event, EventCategory, EventStatus } from '@/types';

const EVENT_STATUSES: ReadonlyArray<EventStatus | 'all'> = [
  'all',
  'planned',
  'ongoing',
  'completed',
];

const EVENT_CATEGORIES: ReadonlyArray<EventCategory | 'all'> = [
  'all',
  'workshop',
  'seminar',
  'outreach',
  'training',
  'meeting',
  'other',
];

function parseEventStatus(value: string | null): EventStatus | 'all' | undefined {
  if (!value || !EVENT_STATUSES.includes(value as EventStatus | 'all')) {
    return undefined;
  }
  return value as EventStatus | 'all';
}

function parseEventCategory(
  value: string | null
): EventCategory | 'all' | undefined {
  if (!value || !EVENT_CATEGORIES.includes(value as EventCategory | 'all')) {
    return undefined;
  }
  return value as EventCategory | 'all';
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = parseEventStatus(searchParams.get('status'));
  const category = parseEventCategory(searchParams.get('category'));
  const search = searchParams.get('search') ?? undefined;

  const data = getEvents({ status, category, search });

  return NextResponse.json({
    data,
    total: data.length,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  });
}

export async function POST(request: Request) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as Partial<Event>;
  const event = createEvent(body);

  return NextResponse.json(event, { status: 201 });
}
