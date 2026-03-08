import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('#login-email').fill('admin@edutrack.org');
    await page.locator('#login-password').fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/home/, { timeout: 10000 });
  });

  test('should display welcome header', async ({ page }) => {
    await expect(page.getByText(/welcome back/i)).toBeVisible();
  });

  test('should display stat cards', async ({ page }) => {
    await expect(page.getByText(/total events/i)).toBeVisible();
    await expect(page.getByText(/active volunteers/i)).toBeVisible();
    await expect(page.getByText(/completed events/i)).toBeVisible();
    await expect(page.getByText(/upcoming events/i)).toBeVisible();
  });

  test('should display analytics section', async ({ page }) => {
    await expect(page.getByText(/analytics overview/i)).toBeVisible();
    await expect(page.getByText(/events by status/i)).toBeVisible();
    await expect(page.getByText(/events per month/i)).toBeVisible();
  });

  test('should display upcoming events section', async ({ page }) => {
    await expect(page.getByText(/upcoming events/i).first()).toBeVisible();
    // "View all" link should navigate to /events
    const viewAll = page.getByRole('link', { name: /view all/i });
    await expect(viewAll).toBeVisible();
    await expect(viewAll).toHaveAttribute('href', '/events');
  });

  test('should have working sidebar navigation on desktop', async ({ page }) => {
    const viewport = page.viewportSize();
    if (viewport && viewport.width >= 1024) {
      // Sidebar has navigation links
      const sidebar = page.getByRole('navigation', { name: /main navigation/i });
      await expect(sidebar).toBeVisible();

      await page.getByRole('link', { name: /events/i }).click();
      await expect(page).toHaveURL(/events/);
    }
  });
});
