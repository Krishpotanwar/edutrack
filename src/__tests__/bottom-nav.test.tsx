import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const mockPathname = vi.fn(() => '/home');
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}));

vi.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get: (_target, tag) => {
        return ({ children, ...props }: any) => {
          const {
            initial, animate, exit, variants, transition,
            whileHover, whileTap, layoutId, layout, onHoverStart, onHoverEnd,
            ...domProps
          } = props;
          const Tag = typeof tag === 'string' ? tag : 'div';
          return <Tag {...domProps}>{children}</Tag>;
        };
      },
    }
  ),
  AnimatePresence: ({ children }: any) => children,
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

import { BottomNav } from '@/components/navigation/bottom-nav';

describe('BottomNav', () => {
  beforeEach(() => {
    mockPathname.mockReturnValue('/home');
  });

  it('renders 5 navigation items', () => {
    render(<BottomNav />);
    const labels = ['Home', 'Calendar', 'Events', 'Profile', 'More'];
    labels.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('renders correct hrefs for all nav items', () => {
    render(<BottomNav />);
    const expectedHrefs = ['/home', '/calendar', '/events', '/profile', '/more'];
    expectedHrefs.forEach((href) => {
      const link = screen.getByRole('link', { name: href.slice(1).charAt(0).toUpperCase() + href.slice(2) || 'Home' });
      expect(link).toHaveAttribute('href', href);
    });
  });

  it('marks Home as active when on /home', () => {
    render(<BottomNav />);
    const homeLink = screen.getByLabelText('Home');
    expect(homeLink).toHaveAttribute('aria-current', 'page');
  });

  it('marks Events as active when on /events', () => {
    mockPathname.mockReturnValue('/events');
    render(<BottomNav />);
    const eventsLink = screen.getByLabelText('Events');
    expect(eventsLink).toHaveAttribute('aria-current', 'page');

    const homeLink = screen.getByLabelText('Home');
    expect(homeLink).not.toHaveAttribute('aria-current', 'page');
  });

  it('marks active on sub-route /events/123', () => {
    mockPathname.mockReturnValue('/events/123');
    render(<BottomNav />);
    const eventsLink = screen.getByLabelText('Events');
    expect(eventsLink).toHaveAttribute('aria-current', 'page');
  });

  it('has mobile navigation landmark', () => {
    render(<BottomNav />);
    const nav = screen.getByRole('navigation', { name: 'Mobile navigation' });
    expect(nav).toBeInTheDocument();
  });

  it('all links have aria-label', () => {
    render(<BottomNav />);
    const labels = ['Home', 'Calendar', 'Events', 'Profile', 'More'];
    labels.forEach((label) => {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    });
  });
});
