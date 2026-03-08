import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('#login-email').fill('admin@edutrack.org');
    await page.locator('#login-password').fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/home/, { timeout: 10000 });
  });

  test('should navigate to all main routes', async ({ page }) => {
    const routes = ['/home', '/calendar', '/events', '/profile', '/reports'];
    for (const route of routes) {
      await page.goto(route);
      await page.waitForLoadState('domcontentloaded');
      // Page should render without 404
      const title = await page.title();
      expect(title).not.toContain('404');
      // Main content area should exist
      await expect(page.locator('#main-content')).toBeVisible();
    }
  });

  test('should show sidebar links on desktop', async ({ page }) => {
    const viewport = page.viewportSize();
    if (viewport && viewport.width >= 1024) {
      const nav = page.getByRole('navigation', { name: /main navigation/i });
      await expect(nav).toBeVisible();

      // Check all sidebar navigation items
      await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /calendar/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /events/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /reports/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /profile/i })).toBeVisible();
    }
  });

  test('should highlight active sidebar link', async ({ page }) => {
    const viewport = page.viewportSize();
    if (viewport && viewport.width >= 1024) {
      // On /home, Dashboard link should be marked current
      const dashboardLink = page.getByRole('link', { name: /dashboard/i });
      await expect(dashboardLink).toHaveAttribute('aria-current', 'page');

      // Navigate to events
      await page.goto('/events');
      const eventsLink = page.getByRole('link', { name: /events/i });
      await expect(eventsLink).toHaveAttribute('aria-current', 'page');
    }
  });

  test('should show EduTrack branding in header on mobile', async ({ page }) => {
    const viewport = page.viewportSize();
    if (viewport && viewport.width && viewport.width < 1024) {
      await expect(page.locator('header').getByText('EduTrack')).toBeVisible();
    }
  });
});
