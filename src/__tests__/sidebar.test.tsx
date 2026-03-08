import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

const mockPathname = vi.fn(() => '/home');
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}));

const mockSetTheme = vi.fn();
const mockTheme = vi.fn(() => 'light');
vi.mock('@/stores/theme-store', () => ({
  useThemeStore: () => ({ theme: mockTheme(), setTheme: mockSetTheme }),
}));

const mockLogout = vi.fn();
const mockUser = vi.fn(() => ({ id: '1', role: 'admin', name: 'Test Admin' }));
vi.mock('@/stores/auth-store', () => ({
  useAuthStore: () => ({ user: mockUser(), logout: mockLogout }),
}));

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

import { Sidebar } from '@/components/navigation/sidebar';

describe('Sidebar', () => {
  beforeEach(() => {
    mockPathname.mockReturnValue('/home');
    mockTheme.mockReturnValue('light');
    mockUser.mockReturnValue({ id: '1', role: 'admin', name: 'Test Admin' });
    mockSetTheme.mockClear();
    mockLogout.mockClear();
  });

  it('renders the EduTrack logo', () => {
    render(<Sidebar />);
    expect(screen.getByText('EduTrack')).toBeInTheDocument();
  });

  it('renders navigation items for admin', () => {
    render(<Sidebar />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Calendar')).toBeInTheDocument();
    expect(screen.getByText('Events')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('hides admin-only items for non-admin users', () => {
    mockUser.mockReturnValue({ id: '2', role: 'volunteer', name: 'Volunteer' });
    render(<Sidebar />);
    expect(screen.queryByText('Users')).not.toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Events')).toBeInTheDocument();
  });

  it('shows correct active state based on pathname', () => {
    mockPathname.mockReturnValue('/events');
    render(<Sidebar />);
    const eventsLink = screen.getByText('Events').closest('a');
    expect(eventsLink).toHaveAttribute('aria-current', 'page');

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).not.toHaveAttribute('aria-current', 'page');
  });

  it('shows active state for sub-routes', () => {
    mockPathname.mockReturnValue('/events/123');
    render(<Sidebar />);
    const eventsLink = screen.getByText('Events').closest('a');
    expect(eventsLink).toHaveAttribute('aria-current', 'page');
  });

  it('has collapse/expand button', () => {
    render(<Sidebar />);
    const btn = screen.getByLabelText('Collapse sidebar');
    expect(btn).toBeInTheDocument();
  });

  it('toggles collapse state on button click', () => {
    render(<Sidebar />);
    const btn = screen.getByLabelText('Collapse sidebar');
    fireEvent.click(btn);
    expect(screen.getByLabelText('Expand sidebar')).toBeInTheDocument();
  });

  it('theme toggle button works in light mode', () => {
    mockTheme.mockReturnValue('light');
    render(<Sidebar />);
    const themeBtn = screen.getByLabelText(/Light mode/i);
    fireEvent.click(themeBtn);
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('theme toggle button works in dark mode', () => {
    mockTheme.mockReturnValue('dark');
    render(<Sidebar />);
    const themeBtn = screen.getByLabelText(/Dark mode/i);
    fireEvent.click(themeBtn);
    expect(mockSetTheme).toHaveBeenCalledWith('system');
  });

  it('shows Dark Mode text when theme is light', () => {
    mockTheme.mockReturnValue('light');
    render(<Sidebar />);
    expect(screen.getByText('Dark Mode')).toBeInTheDocument();
  });

  it('shows Light Mode text when theme is dark', () => {
    mockTheme.mockReturnValue('dark');
    render(<Sidebar />);
    expect(screen.getByText('Light Mode')).toBeInTheDocument();
  });

  it('logout button is present and calls logout', () => {
    render(<Sidebar />);
    const logoutBtn = screen.getByLabelText('Logout from account');
    expect(logoutBtn).toBeInTheDocument();
    fireEvent.click(logoutBtn);
    expect(mockLogout).toHaveBeenCalled();
  });

  it('renders Logout text', () => {
    render(<Sidebar />);
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('nav links have correct hrefs', () => {
    render(<Sidebar />);
    const dashLink = screen.getByText('Dashboard').closest('a');
    expect(dashLink).toHaveAttribute('href', '/home');
    const eventsLink = screen.getByText('Events').closest('a');
    expect(eventsLink).toHaveAttribute('href', '/events');
  });

  it('has navigation landmark', () => {
    render(<Sidebar />);
    const nav = screen.getByRole('navigation', { name: 'Main navigation' });
    expect(nav).toBeInTheDocument();
  });
});
