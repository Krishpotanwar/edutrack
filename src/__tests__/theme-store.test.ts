import { describe, it, expect, beforeEach, vi } from 'vitest';

import { useThemeStore } from '@/stores/theme-store';

describe('useThemeStore', () => {
  beforeEach(() => {
    useThemeStore.setState({ theme: 'system' });
  });

  it('has system as default theme', () => {
    const { theme } = useThemeStore.getState();
    expect(theme).toBe('system');
  });

  it('setTheme changes theme to dark', () => {
    useThemeStore.getState().setTheme('dark');
    expect(useThemeStore.getState().theme).toBe('dark');
  });

  it('setTheme changes theme to light', () => {
    useThemeStore.getState().setTheme('light');
    expect(useThemeStore.getState().theme).toBe('light');
  });

  it('setTheme changes theme back to system', () => {
    useThemeStore.getState().setTheme('dark');
    useThemeStore.getState().setTheme('system');
    expect(useThemeStore.getState().theme).toBe('system');
  });

  it('persists theme key name as edutrack-theme', () => {
    // The store uses persist middleware with name 'edutrack-theme'
    // We verify the store has persist configuration
    expect(useThemeStore.persist).toBeDefined();
    expect(useThemeStore.persist.getOptions().name).toBe('edutrack-theme');
  });
});
