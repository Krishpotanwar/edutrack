import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { DonutChart } from '@/components/dashboard/donut-chart';
import { BarChartComponent } from '@/components/dashboard/bar-chart';
import { StatCard } from '@/components/dashboard/stat-card';
import { CalendarDays } from 'lucide-react';

// Mock ResizeObserver for recharts ResponsiveContainer
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserverMock;

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  const MOTION_PROPS = new Set(['initial', 'animate', 'exit', 'variants', 'transition', 'whileHover', 'whileTap', 'whileFocus', 'whileInView', 'layout', 'layoutId', 'onHoverStart', 'onHoverEnd']);
  return {
    ...actual,
    motion: new Proxy(actual.motion, {
      get: (_target, prop: string) => {
        const Component = (props: Record<string, unknown>) => {
          const rest: Record<string, unknown> = {};
          for (const [key, value] of Object.entries(props)) {
            if (!MOTION_PROPS.has(key)) rest[key] = value;
          }
          return React.createElement(prop, rest);
        };
        Component.displayName = `motion.${prop}`;
        return Component;
      },
    }),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

const mockDashboardStats = {
  totalEvents: 24,
  activeVolunteers: 48,
  completedEvents: 18,
  upcomingEvents: 6,
};

const mockReportsOverview = {
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

const server = setupServer(
  http.get('/api/dashboard/stats', () => {
    return HttpResponse.json(mockDashboardStats);
  }),
  http.get('/api/reports/overview', () => {
    return HttpResponse.json(mockReportsOverview);
  }),
  http.get('/api/events', () => {
    return HttpResponse.json({ data: [], total: 0, page: 1, pageSize: 10, totalPages: 0 });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterAll(() => server.close());
beforeEach(() => server.resetHandlers());

describe('Dashboard Charts', () => {
  describe('DonutChart', () => {
    it('renders with title', () => {
      render(
        <DonutChart
          title="Events by Status"
          data={mockReportsOverview.eventsByStatus}
        />
      );
      expect(screen.getByText('Events by Status')).toBeInTheDocument();
    });

    it('renders the chart container for provided data', () => {
      const { container } = render(
        <DonutChart
          title="Events by Status"
          data={mockReportsOverview.eventsByStatus}
        />
      );
      // ResponsiveContainer renders at 0x0 in jsdom, so we verify the container exists
      expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
    });

    it('renders with empty data', () => {
      render(<DonutChart title="Empty Chart" data={[]} />);
      expect(screen.getByText('Empty Chart')).toBeInTheDocument();
    });

    it('accepts custom className', () => {
      const { container } = render(
        <DonutChart
          title="Test"
          data={mockReportsOverview.eventsByStatus}
          className="custom-chart-class"
        />
      );
      expect(container.querySelector('.custom-chart-class')).toBeInTheDocument();
    });
  });

  describe('BarChartComponent', () => {
    it('renders with title', () => {
      render(
        <BarChartComponent
          title="Events per Month"
          data={mockReportsOverview.eventsPerMonth}
        />
      );
      expect(screen.getByText('Events per Month')).toBeInTheDocument();
    });

    it('renders the chart container for provided data', () => {
      const { container } = render(
        <BarChartComponent
          title="Events per Month"
          data={mockReportsOverview.eventsPerMonth}
        />
      );
      // ResponsiveContainer renders at 0x0 in jsdom, so we verify the container exists
      expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
    });

    it('renders with empty data', () => {
      render(<BarChartComponent title="Empty Bar" data={[]} />);
      expect(screen.getByText('Empty Bar')).toBeInTheDocument();
    });

    it('accepts custom className', () => {
      const { container } = render(
        <BarChartComponent
          title="Test"
          data={mockReportsOverview.eventsPerMonth}
          className="my-bar-chart"
        />
      );
      expect(container.querySelector('.my-bar-chart')).toBeInTheDocument();
    });
  });

  describe('StatCard', () => {
    it('renders label and animated value', async () => {
      render(
        <StatCard
          icon={CalendarDays}
          value={24}
          label="Total Events"
          colorVariant="primary"
        />
      );
      expect(screen.getByText('Total Events')).toBeInTheDocument();
      // The animated counter will eventually show the value
      await waitFor(() => {
        expect(screen.getByText('24')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('renders trend badge when provided', () => {
      render(
        <StatCard
          icon={CalendarDays}
          value={48}
          label="Active Volunteers"
          trend={{ value: 8, positive: true }}
          colorVariant="blue"
        />
      );
      expect(screen.getByText('+8%')).toBeInTheDocument();
    });

    it('renders negative trend', () => {
      render(
        <StatCard
          icon={CalendarDays}
          value={10}
          label="Metric"
          trend={{ value: 5, positive: false }}
        />
      );
      expect(screen.getByText('5%')).toBeInTheDocument();
    });

    it('renders string value directly', () => {
      render(
        <StatCard
          icon={CalendarDays}
          value="N/A"
          label="No Data"
        />
      );
      expect(screen.getByText('N/A')).toBeInTheDocument();
    });
  });
});
