import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

import { useAuthStore } from '@/stores/auth-store';

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
    mockFetch.mockReset();
  });

  it('has correct initial state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
  });

  it('login sets user and token on success', async () => {
    const mockUser = { id: '1', name: 'Test User', email: 'test@example.com', role: 'admin' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUser, token: 'test-token-123' }),
    });

    await useAuthStore.getState().login({ email: 'test@example.com', password: 'password123' });

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe('test-token-123');
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
  });

  it('login throws and resets loading on failure', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });

    await expect(
      useAuthStore.getState().login({ email: 'bad@example.com', password: 'wrong' })
    ).rejects.toThrow('Login failed');

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
  });

  it('logout clears user, token, and auth state', () => {
    // First set some state
    useAuthStore.setState({
      user: { id: '1', name: 'Test', email: 'test@test.com', role: 'admin' } as any,
      token: 'some-token',
      isAuthenticated: true,
    });

    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('register sets user and token on success', async () => {
    const mockUser = { id: '2', name: 'New User', email: 'new@example.com', role: 'volunteer' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUser, token: 'new-token-456' }),
    });

    await useAuthStore.getState().register({
      name: 'New User',
      email: 'new@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe('new-token-456');
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
  });

  it('register throws on failure', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });

    await expect(
      useAuthStore.getState().register({
        name: 'Fail User',
        email: 'fail@example.com',
        password: 'password',
        confirmPassword: 'password',
      })
    ).rejects.toThrow('Registration failed');

    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it('setUser updates user and isAuthenticated', () => {
    const user = { id: '3', name: 'Direct', email: 'direct@test.com', role: 'coordinator' } as any;
    useAuthStore.getState().setUser(user);

    expect(useAuthStore.getState().user).toEqual(user);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it('setUser with null sets isAuthenticated to false', () => {
    useAuthStore.setState({ user: { id: '1' } as any, isAuthenticated: true });
    useAuthStore.getState().setUser(null);

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('setToken updates token', () => {
    useAuthStore.getState().setToken('new-token');
    expect(useAuthStore.getState().token).toBe('new-token');
  });

  it('setLoading updates isLoading', () => {
    useAuthStore.getState().setLoading(true);
    expect(useAuthStore.getState().isLoading).toBe(true);

    useAuthStore.getState().setLoading(false);
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it('persists with correct key name', () => {
    expect(useAuthStore.persist).toBeDefined();
    expect(useAuthStore.persist.getOptions().name).toBe('edutrack-auth');
  });

  it('only persists user, token, and isAuthenticated', () => {
    const partialize = useAuthStore.persist.getOptions().partialize;
    if (partialize) {
      const fullState = {
        user: { id: '1' } as any,
        token: 'tok',
        isAuthenticated: true,
        isLoading: true,
        login: vi.fn(),
        loginWithGoogle: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        setUser: vi.fn(),
        setToken: vi.fn(),
        setLoading: vi.fn(),
      };
      const persisted = partialize(fullState);
      expect(persisted).toEqual({
        user: { id: '1' },
        token: 'tok',
        isAuthenticated: true,
      });
      // isLoading should NOT be persisted
      expect((persisted as any).isLoading).toBeUndefined();
    }
  });
});
