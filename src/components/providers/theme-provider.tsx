'use client';

import { useEffect, useState } from 'react';
import { useThemeStore } from '@/stores/theme-store';

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Standard mount detection pattern
    setMounted(true);
  }, []);

  // On first mount with no stored preference, adopt system theme
  useEffect(() => {
    if (!mounted) return;
    if (theme === null) {
      setTheme(getSystemTheme());
    }
  }, [mounted, theme, setTheme]);

  // Apply theme class to documentElement
  useEffect(() => {
    if (!mounted || theme === null) return;
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme, mounted]);

  // Listen for system preference changes and auto-update if user hasn't manually toggled
  useEffect(() => {
    if (!mounted) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-follow system changes if user hasn't stored a preference yet
      const stored = localStorage.getItem('edutrack-theme');
      if (!stored) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mounted, setTheme]);

  if (!mounted) {
    return null;
  }

  return <>{children}</>;
}
