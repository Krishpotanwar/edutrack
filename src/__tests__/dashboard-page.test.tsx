import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
  usePathname: vi.fn(() => '/home'),
}));

vi.mock('next/link', () => ({
  default: (props: Record<string, unknown>) => {
    const { children, href, ...rest } = props;
    return React.createElement('a', { ...rest, href }, children);
  },
}));

vi.mock('framer-motion', () => {
  const MOTION_PROPS = new Set(['initial', 'animate', 'exit', 'variants', 'transition', 'whileHover', 'whileTap', 'layoutId', 'layout', 'onHoverStart', 'onHoverEnd', 'whileInView']);
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

// Mock dashboard sub-components to isolate
vi.mock('@/components/dashboard', () => ({
  MiniCalendar: () => <div data-testid="mini-calendar">Calendar</div>,
  TodayEvents: () => <div data-testid="today-events">Today Events</div>,
  DonutChart: ({ title }: { title?: string }) => <div data-testid="donut-chart">{title}</div>,
  BarChartComponent: ({ title }: { title?: string }) => <div data-testid="bar-chart">{title}</div>,
}));

vi.mock('@/components/events', () => ({
  EventCard: ({ event }: { event: { title: string } }) => <div data-testid="event-card">{event.title}</div>,
}));

vi.mock('@/components/glass', () => ({
  SkeletonStatCard: () => <div data-testid="skeleton-stat" />,
  SkeletonChart: () => <div data-testid="skeleton-chart" />,
  SkeletonEventCard: () => <div data-testid="skeleton-event" />,
  SkeletonCard: () => <div data-testid="skeleton-card" />,
}));

// Track useQuery calls
const mockUseQuery = vi.fn();
vi.mock('@tanstack/react-query', () => ({
  useQuery: (opts: unknown) => mockUseQuery(opts),
}));

import DashboardPage from '@/app/(dashboard)/home/page';

const defaultQueryMock = (opts: { queryKey: string[] }) => {
  if (opts.queryKey[0] === 'events') return { data: { data: [] }, isLoading: false };
  return { data: undefined, isLoading: false };
};

describe('DashboardPage', () => {
  it('renders welcome message', () => {
    mockUseQuery.mockImplementation((opts: { queryKey: string[] }) => {
      if (opts.queryKey[0] === 'events') return { data: { data: [] }, isLoading: false };
      return { data: undefined, isLoading: true };
    });
    render(<DashboardPage />);
    expect(screen.getByText(/Good (Morning|Afternoon|Evening)/)).toBeInTheDocument();
  });

  it('shows loading skeletons when stats are loading', () => {
    mockUseQuery.mockImplementation((opts: { queryKey: string[] }) => {
      if (opts.queryKey[0] === 'events') return { data: { data: [] }, isLoading: false };
      return { data: undefined, isLoading: true };
    });
    render(<DashboardPage />);
    const skeletons = screen.getAllByTestId('skeleton-stat');
    expect(skeletons.length).toBeGreaterThanOrEqual(4);
  });

  it('shows stat cards when data loads', () => {
    mockUseQuery.mockImplementation((opts: { queryKey: string[] }) => {
      if (opts.queryKey[0] === 'dashboard-stats') {
        return {
          data: { totalEvents: 10, activeVolunteers: 20, completedEvents: 5, upcomingEvents: 3 },
          isLoading: false,
        };
      }
      if (opts.queryKey[0] === 'events') {
        return { data: { data: [] }, isLoading: false };
      }
      if (opts.queryKey[0] === 'reports-overview') {
        return { data: { eventsByStatus: [], eventsPerMonth: [] }, isLoading: false };
      }
      return { data: undefined, isLoading: false };
    });

    render(<DashboardPage />);
    expect(screen.getByText('Total Events')).toBeInTheDocument();
    expect(screen.getByText('Active Volunteers')).toBeInTheDocument();
    expect(screen.getByText('Completed Events')).toBeInTheDocument();
    // "Upcoming Events" appears in both stat card label and section title
    const upcomingTexts = screen.getAllByText('Upcoming Events');
    expect(upcomingTexts.length).toBeGreaterThanOrEqual(1);
  });

  it('shows "Upcoming Events" section title', () => {
    mockUseQuery.mockImplementation(defaultQueryMock);
    render(<DashboardPage />);
    const upcomingTexts = screen.getAllByText('Upcoming Events');
    expect(upcomingTexts.length).toBeGreaterThanOrEqual(1);
  });

  it('shows "Analytics Overview" section title', () => {
    mockUseQuery.mockImplementation(defaultQueryMock);
    render(<DashboardPage />);
    expect(screen.getByText('Analytics Overview')).toBeInTheDocument();
  });

  it('shows Recent Activity section', () => {
    mockUseQuery.mockImplementation(defaultQueryMock);
    render(<DashboardPage />);
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
  });

  it('shows Goals Progress section', () => {
    mockUseQuery.mockImplementation(defaultQueryMock);
    render(<DashboardPage />);
    expect(screen.getByText('Goals Progress')).toBeInTheDocument();
  });

  it('renders EduTrack Dashboard footer text', () => {
    mockUseQuery.mockImplementation(defaultQueryMock);
    render(<DashboardPage />);
    expect(screen.getByText('EduTrack Dashboard')).toBeInTheDocument();
  });
});
