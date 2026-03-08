import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, back: vi.fn() }),
  usePathname: vi.fn(() => '/login'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

const mockLogin = vi.fn();
const mockRegister = vi.fn();
const mockLoginWithGoogle = vi.fn();
vi.mock('@/stores/auth-store', () => ({
  useAuthStore: () => ({
    login: mockLogin,
    register: mockRegister,
    loginWithGoogle: mockLoginWithGoogle,
    isLoading: false,
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
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
    useAnimation: () => ({ start: vi.fn(), stop: vi.fn() }),
  };
});

vi.mock('@/components/effects/floating-letters', () => ({
  FloatingLetters: () => <div data-testid="floating-letters" />,
}));

import LoginPage from '@/app/(auth)/login/page';

describe('LoginPage', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockLogin.mockClear();
    mockRegister.mockClear();
    mockLoginWithGoogle.mockClear();
  });

  it('renders login form by default', () => {
    render(<LoginPage />);
    expect(screen.getByText('Welcome Back!')).toBeInTheDocument();
  });

  it('shows email input field', () => {
    render(<LoginPage />);
    const emailInput = document.getElementById('login-email');
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('type', 'email');
  });

  it('shows password input field', () => {
    render(<LoginPage />);
    const passwordInput = document.getElementById('login-password');
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('shows Sign In button', () => {
    render(<LoginPage />);
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('shows toggle to register mode', () => {
    render(<LoginPage />);
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
    expect(screen.getByText('Sign up')).toBeInTheDocument();
  });

  it('switches to register mode when Sign up is clicked', () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByText('Sign up'));
    const headings = screen.getAllByText('Create Account');
    expect(headings.length).toBeGreaterThanOrEqual(1);
  });

  it('register mode shows name field', () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByText('Sign up'));
    const nameInput = document.getElementById('register-name');
    expect(nameInput).toBeInTheDocument();
  });

  it('register mode shows confirm password field', () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByText('Sign up'));
    const confirmInput = document.getElementById('register-confirm');
    expect(confirmInput).toBeInTheDocument();
  });

  it('switches back to login mode', () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByText('Sign up'));
    expect(screen.getAllByText('Create Account').length).toBeGreaterThanOrEqual(1);
    fireEvent.click(screen.getByText('Sign in'));
    expect(screen.getByText('Welcome Back!')).toBeInTheDocument();
  });

  it('shows EduTrack branding', () => {
    render(<LoginPage />);
    const brands = screen.getAllByText('EduTrack');
    expect(brands.length).toBeGreaterThanOrEqual(1);
  });
});
