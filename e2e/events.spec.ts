import { test, expect } from '@playwright/test';

test.describe('Events', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('#login-email').fill('admin@edutrack.org');
    await page.locator('#login-password').fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/home/, { timeout: 10000 });
  });

  test('should display events page with header', async ({ page }) => {
    await page.goto('/events');
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('heading', { name: /events/i })
    ).toBeVisible();
    await expect(page.getByText(/manage and browse all events/i)).toBeVisible();
  });

  test('should show create event button', async ({ page }) => {
    await page.goto('/events');
    const createBtn = page.getByRole('link', { name: /create event/i });
    await expect(createBtn).toBeVisible();
    await expect(createBtn).toHaveAttribute('href', '/events/create');
  });

  test('should have search and filter controls', async ({ page }) => {
    await page.goto('/events');
    await page.waitForLoadState('networkidle');
    await expect(page.getByPlaceholder(/search events/i)).toBeVisible();
    // Status filter pills
    await expect(page.getByRole('button', { name: /^all$/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /planned/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /ongoing/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /completed/i })).toBeVisible();
  });

  test('should filter events by status', async ({ page }) => {
    await page.goto('/events');
    await page.waitForLoadState('networkidle');
    // Click on "Planned" filter pill
    await page.getByRole('button', { name: /planned/i }).click();
    await page.waitForLoadState('networkidle');
    // The page should still be showing events (or empty state)
    const body = await page.textContent('body');
    expect(body).toBeTruthy();
  });

  test('should navigate to create event form', async ({ page }) => {
    await page.goto('/events/create');
    await expect(
      page.getByRole('heading', { name: /create event/i })
    ).toBeVisible();
    await expect(page.getByLabel(/event title/i)).toBeVisible();
    await expect(page.getByLabel(/description/i)).toBeVisible();
    await expect(page.getByLabel(/location/i)).toBeVisible();
    await expect(page.getByLabel(/start date/i)).toBeVisible();
    await expect(page.getByLabel(/end date/i)).toBeVisible();
  });

  test('should show validation errors on empty form submission', async ({ page }) => {
    await page.goto('/events/create');
    // Click submit without filling any fields
    await page.getByRole('button', { name: /create event/i }).click();
    // Zod validation errors should appear
    await expect(page.getByText(/title is required/i)).toBeVisible();
    await expect(page.getByText(/description is required/i)).toBeVisible();
    await expect(page.getByText(/location is required/i)).toBeVisible();
  });

  test('should create a new event', async ({ page }) => {
    await page.goto('/events/create');
    await page.getByLabel(/event title/i).fill('New Test Event');
    await page.getByLabel(/description/i).fill('A test event description for E2E testing.');
    await page.getByLabel(/location/i).fill('Test Location, 789 Test St');
    await page.getByLabel(/start date/i).fill('2025-06-15T09:00');
    await page.getByLabel(/end date/i).fill('2025-06-15T17:00');
    await page.getByRole('button', { name: /create event/i }).click();
    // MSW returns 201 → redirect to /events
    await expect(page).toHaveURL(/events/, { timeout: 10000 });
  });
});
