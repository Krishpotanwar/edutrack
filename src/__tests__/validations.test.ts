import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  registerSchema,
  eventSchema,
  profileSchema,
} from '@/lib/validations';

describe('loginSchema', () => {
  it('validates correct login data', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing email', () => {
    const result = loginSchema.safeParse({
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email format', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Please enter a valid email address');
    }
  });

  it('rejects short password', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: '123',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Password must be at least 6 characters');
    }
  });

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing password', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
    });
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  it('validates correct registration data', () => {
    const result = registerSchema.safeParse({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects mismatched passwords', () => {
    const result = registerSchema.safeParse({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'differentpass',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const confirmError = result.error.issues.find(
        (i) => i.path.includes('confirmPassword')
      );
      expect(confirmError?.message).toBe('Passwords do not match');
    }
  });

  it('rejects short name', () => {
    const result = registerSchema.safeParse({
      name: 'J',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Name must be at least 2 characters');
    }
  });

  it('rejects invalid email', () => {
    const result = registerSchema.safeParse({
      name: 'John',
      email: 'invalid',
      password: 'password123',
      confirmPassword: 'password123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects short password', () => {
    const result = registerSchema.safeParse({
      name: 'John',
      email: 'john@example.com',
      password: '12345',
      confirmPassword: '12345',
    });
    expect(result.success).toBe(false);
  });
});

describe('eventSchema', () => {
  const validEvent = {
    title: 'Workshop on Testing',
    description: 'Learn about testing best practices',
    location: 'Room 101',
    startDate: '2025-01-15',
    endDate: '2025-01-16',
    category: 'workshop' as const,
    status: 'planned' as const,
    tags: ['testing', 'vitest'],
    photos: [],
    isPublic: true,
  };

  it('validates correct event data', () => {
    const result = eventSchema.safeParse(validEvent);
    expect(result.success).toBe(true);
  });

  it('validates with optional maxParticipants', () => {
    const result = eventSchema.safeParse({
      ...validEvent,
      maxParticipants: 50,
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty title', () => {
    const result = eventSchema.safeParse({ ...validEvent, title: '' });
    expect(result.success).toBe(false);
  });

  it('rejects title over 100 characters', () => {
    const result = eventSchema.safeParse({
      ...validEvent,
      title: 'a'.repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid category', () => {
    const result = eventSchema.safeParse({
      ...validEvent,
      category: 'invalid',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid status', () => {
    const result = eventSchema.safeParse({
      ...validEvent,
      status: 'invalid',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty description', () => {
    const result = eventSchema.safeParse({ ...validEvent, description: '' });
    expect(result.success).toBe(false);
  });

  it('accepts all valid categories', () => {
    const categories = ['workshop', 'seminar', 'outreach', 'training', 'meeting', 'other'] as const;
    for (const category of categories) {
      const result = eventSchema.safeParse({ ...validEvent, category });
      expect(result.success).toBe(true);
    }
  });
});

describe('profileSchema', () => {
  it('validates correct profile data', () => {
    const result = profileSchema.safeParse({
      name: 'Jane Doe',
      email: 'jane@example.com',
    });
    expect(result.success).toBe(true);
  });

  it('validates with optional fields', () => {
    const result = profileSchema.safeParse({
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '555-1234',
      department: 'Engineering',
      bio: 'Hello world',
    });
    expect(result.success).toBe(true);
  });

  it('rejects bio over 500 characters', () => {
    const result = profileSchema.safeParse({
      name: 'Jane Doe',
      email: 'jane@example.com',
      bio: 'x'.repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it('rejects short name', () => {
    const result = profileSchema.safeParse({
      name: 'J',
      email: 'jane@example.com',
    });
    expect(result.success).toBe(false);
  });
});
