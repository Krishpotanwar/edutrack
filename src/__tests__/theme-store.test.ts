import { describe, it, expect, beforeEach } from 'vitest';

import { useThemeStore } from '@/stores/theme-store';

describe('useThemeStore', () => {
  beforeEach(() => {
    useThemeStore.setState({ theme: null });
  });

  it('has null as default theme (follows system)', () => {
    const { theme } = useThemeStore.getState();
    expect(theme).toBeNull();
  });

  it('setTheme changes theme to dark', () => {
    useThemeStore.getState().setTheme('dark');
    expect(useThemeStore.getState().theme).toBe('dark');
  });

  it('setTheme changes theme to light', () => {
    useThemeStore.getState().setTheme('light');
    expect(useThemeStore.getState().theme).toBe('light');
  });

  it('setTheme toggles between light and dark', () => {
    useThemeStore.getState().setTheme('dark');
    expect(useThemeStore.getState().theme).toBe('dark');
    useThemeStore.getState().setTheme('light');
    expect(useThemeStore.getState().theme).toBe('light');
  });

  it('persists theme key name as edutrack-theme', () => {
    expect(useThemeStore.persist).toBeDefined();
    expect(useThemeStore.persist.getOptions().name).toBe('edutrack-theme');
  });
});
