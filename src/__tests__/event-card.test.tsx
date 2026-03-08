import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import type { Event } from '@/types';

vi.mock('framer-motion', () => {
  const MOTION_PROPS = new Set(['initial', 'animate', 'exit', 'variants', 'transition', 'whileHover', 'whileTap', 'layoutId', 'layout', 'onHoverStart', 'onHoverEnd']);
  return {
    motion: new Proxy(
      {},
      {
        get: (_target, tag) => {
          return (props: Record<string, unknown>) => {
            const domProps: Record<string, unknown> = {};
            for (const [key, value] of Object.entries(props)) {
              if (key !== 'children' && !MOTION_PROPS.has(key)) domProps[key] = value;
            }
            return React.createElement(typeof tag === 'string' ? tag : 'div', domProps, props.children);
          };
        },
      }
    ),
    AnimatePresence: ({ children }: { children?: React.ReactNode }) => children,
  };
});

vi.mock('next/link', () => ({
  default: (props: Record<string, unknown>) => {
    const { children, href, ...rest } = props;
    return React.createElement('a', { ...rest, href }, children);
  },
}));

import { EventCard } from '@/components/events/event-card';

const mockEvent: Event = {
  id: 'evt-1',
  title: 'Community Workshop',
  description: 'A workshop about community building and collaboration.',
  location: 'Main Hall',
  startDate: '2025-03-15T10:00:00.000Z',
  endDate: '2025-03-15T16:00:00.000Z',
  category: 'workshop',
  status: 'planned',
  tags: ['community', 'education'],
  photos: [],
  createdBy: 'user-1',
  attendees: ['user-2', 'user-3', 'user-4'],
  isPublic: true,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

describe('EventCard', () => {
  it('renders event title', () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.getByText('Community Workshop')).toBeInTheDocument();
  });

  it('renders event description', () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.getByText(/A workshop about community building/)).toBeInTheDocument();
  });

  it('shows status badge', () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.getByText('Planned')).toBeInTheDocument();
  });

  it('shows formatted date', () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.getByText('Mar 15, 2025')).toBeInTheDocument();
  });

  it('shows location', () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.getByText('Main Hall')).toBeInTheDocument();
  });

  it('shows attendee count', () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('shows category', () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.getByText('workshop')).toBeInTheDocument();
  });

  it('links to event detail page', () => {
    render(<EventCard event={mockEvent} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/events/evt-1');
  });

  it('renders with custom className', () => {
    const { container } = render(
      <EventCard event={mockEvent} className="my-custom" />
    );
    expect(container.querySelector('.my-custom')).toBeInTheDocument();
  });

  it('renders ongoing status badge', () => {
    render(<EventCard event={{ ...mockEvent, status: 'ongoing' }} />);
    expect(screen.getByText('Ongoing')).toBeInTheDocument();
  });

  it('renders completed status badge', () => {
    render(<EventCard event={{ ...mockEvent, status: 'completed' }} />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });
});
