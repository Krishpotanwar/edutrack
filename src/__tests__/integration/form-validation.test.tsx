import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import CreateEventPage from '@/app/(dashboard)/events/create/page';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/events/create',
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock framer-motion
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return {
    ...actual,
    motion: new Proxy(actual.motion, {
      get: (_target, prop: string) => {
        const Component = (props: Record<string, unknown>) => {
          const {
            initial: _initial,
            animate: _animate,
            exit: _exit,
            transition: _transition,
            whileHover: _whileHover,
            whileTap: _whileTap,
            whileFocus: _whileFocus,
            whileInView: _whileInView,
            layout: _layout,
            layoutId: _layoutId,
            variants: _variants,
            onHoverStart: _onHoverStart,
            onHoverEnd: _onHoverEnd,
            ...rest
          } = props;
          return React.createElement(prop, rest);
        };
        Component.displayName = `motion.${prop}`;
        return Component;
      },
    }),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

const server = setupServer(
  http.post('/api/events', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      {
        id: '99',
        ...body,
        createdBy: '1',
        attendees: ['1'],
        photos: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { status: 201 }
    );
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterAll(() => server.close());
beforeEach(() => {
  server.resetHandlers();
  mockPush.mockClear();
});

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

function renderWithProviders() {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <CreateEventPage />
    </QueryClientProvider>
  );
}

describe('Create Event Form Validation', () => {
  it('renders the create event form', () => {
    renderWithProviders();
    expect(screen.getByRole('heading', { name: /create event/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/event title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
  });

  it('shows validation errors for empty required fields', async () => {
    const user = userEvent.setup();
    renderWithProviders();

    // Submit without filling anything
    const submitBtn = screen.getByRole('button', { name: /create event/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText(/description is required/i)).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText(/location is required/i)).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText(/start date is required/i)).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText(/end date is required/i)).toBeInTheDocument();
    });
  });

  it('validates title max length', async () => {
    const user = userEvent.setup();
    renderWithProviders();

    const titleInput = screen.getByLabelText(/event title/i);
    // Type a string longer than 100 characters
    await user.type(titleInput, 'A'.repeat(101));

    const submitBtn = screen.getByRole('button', { name: /create event/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/title too long/i)).toBeInTheDocument();
    });
  });

  it('submits valid form data successfully', async () => {
    const user = userEvent.setup();
    const { fireEvent } = await import('@testing-library/react');
    renderWithProviders();

    // Fill in all required fields
    await user.type(screen.getByLabelText(/event title/i), 'Integration Test Event');
    await user.type(screen.getByLabelText(/description/i), 'A test event for integration testing.');
    await user.type(screen.getByLabelText(/location/i), 'Test Venue');

    // For datetime-local inputs, use both change and input events for react-hook-form
    const startDateInput = screen.getByLabelText(/start date/i);
    const endDateInput = screen.getByLabelText(/end date/i);
    fireEvent.input(startDateInput, { target: { value: '2025-06-15T09:00' } });
    fireEvent.change(startDateInput, { target: { value: '2025-06-15T09:00' } });
    fireEvent.input(endDateInput, { target: { value: '2025-06-15T17:00' } });
    fireEvent.change(endDateInput, { target: { value: '2025-06-15T17:00' } });

    // maxParticipants with valueAsNumber produces NaN when empty, which fails zod
    fireEvent.change(screen.getByLabelText(/max participants/i), {
      target: { value: '50' },
    });

    const submitBtn = screen.getByRole('button', { name: /create event/i });
    await user.click(submitBtn);

    // After successful submission, router.push('/events') is called
    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith('/events');
      },
      { timeout: 10000 }
    );
  }, 15000);

  it('shows error on API failure', async () => {
    // Override handler to return error
    server.use(
      http.post('/api/events', () => {
        return HttpResponse.json({ message: 'Server error' }, { status: 500 });
      })
    );

    const { toast } = await import('sonner');
    const user = userEvent.setup();
    const { fireEvent } = await import('@testing-library/react');
    renderWithProviders();

    await user.type(screen.getByLabelText(/event title/i), 'Failing Event');
    await user.type(screen.getByLabelText(/description/i), 'This should fail.');
    await user.type(screen.getByLabelText(/location/i), 'Nowhere');
    fireEvent.input(screen.getByLabelText(/start date/i), {
      target: { value: '2025-06-15T09:00' },
    });
    fireEvent.change(screen.getByLabelText(/start date/i), {
      target: { value: '2025-06-15T09:00' },
    });
    fireEvent.input(screen.getByLabelText(/end date/i), {
      target: { value: '2025-06-15T17:00' },
    });
    fireEvent.change(screen.getByLabelText(/end date/i), {
      target: { value: '2025-06-15T17:00' },
    });

    // maxParticipants with valueAsNumber produces NaN when empty, which fails zod
    fireEvent.change(screen.getByLabelText(/max participants/i), {
      target: { value: '30' },
    });

    const submitBtn = screen.getByRole('button', { name: /create event/i });
    await user.click(submitBtn);

    await waitFor(
      () => {
        expect(toast.error).toHaveBeenCalledWith('Failed to create event');
      },
      { timeout: 10000 }
    );
  }, 15000);

  it('has a cancel button linking back to events', () => {
    renderWithProviders();
    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    expect(cancelBtn).toBeInTheDocument();
    // The cancel button is wrapped in a Link to /events
    const cancelLink = cancelBtn.closest('a');
    expect(cancelLink).toHaveAttribute('href', '/events');
  });

  it('renders category and status selects with default values', () => {
    renderWithProviders();
    // The Select components show default text
    expect(screen.getByText(/workshop/i)).toBeInTheDocument();
    expect(screen.getByText(/planned/i)).toBeInTheDocument();
  });

  it('renders public event toggle', () => {
    renderWithProviders();
    expect(screen.getByLabelText(/public event/i)).toBeInTheDocument();
    // Default is checked (isPublic: true)
    const toggle = screen.getByRole('switch');
    expect(toggle).toBeInTheDocument();
  });
});
