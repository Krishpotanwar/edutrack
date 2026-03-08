import { beforeEach, afterEach, vi } from 'vitest';
import '@testing-library/jest-dom';

// Provide localStorage mock for jsdom (opaque origins throw SecurityError)
if (typeof window !== 'undefined') {
  try {
    window.localStorage.getItem('test');
  } catch {
    const store: Record<string, string> = {};
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: (key: string) => store[key] ?? null,
        setItem: (key: string, value: string) => { store[key] = value; },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { Object.keys(store).forEach(k => delete store[k]); },
        get length() { return Object.keys(store).length; },
        key: (i: number) => Object.keys(store)[i] ?? null,
      },
      writable: true,
      configurable: true,
    });
  }
}

// Provide matchMedia mock for jsdom
if (typeof window !== 'undefined' && !window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

// Global test configuration
beforeEach(() => {
  // Add any global test setup here
});

afterEach(() => {
  // Clean up after each test
});
