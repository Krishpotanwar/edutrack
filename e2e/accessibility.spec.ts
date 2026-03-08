import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('login page has proper form inputs', async ({ page }) => {
    await page.goto('/login');
    // Email and password inputs should be visible and have associated labels
    const emailInput = page.locator('#login-email');
    await expect(emailInput).toBeVisible();
    const emailLabel = page.locator('label[for="login-email"]');
    await expect(emailLabel).toBeAttached();

    const passwordInput = page.locator('#login-password');
    await expect(passwordInput).toBeVisible();
    const passwordLabel = page.locator('label[for="login-password"]');
    await expect(passwordLabel).toBeAttached();
  });

  test('login page has accessible submit button', async ({ page }) => {
    await page.goto('/login');
    const submitBtn = page.getByRole('button', { name: /sign in/i });
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toBeEnabled();
  });

  test('skip to main content link exists', async ({ page }) => {
    // Login and navigate to dashboard (which uses the DashboardLayout)
    await page.goto('/login');
    await page.locator('#login-email').fill('admin@edutrack.org');
    await page.locator('#login-password').fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/home/, { timeout: 10000 });

    // The skip link is sr-only but should be in the DOM
    const skipLink = page.getByText(/skip to main content/i);
    await expect(skipLink).toBeAttached();
    await expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  test('main content landmark exists', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#login-email').fill('admin@edutrack.org');
    await page.locator('#login-password').fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/home/, { timeout: 10000 });

    // main element with id="main-content" should exist
    const mainContent = page.locator('main#main-content');
    await expect(mainContent).toBeVisible();
  });

  test('sidebar navigation has proper aria attributes', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#login-email').fill('admin@edutrack.org');
    await page.locator('#login-password').fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/home/, { timeout: 10000 });

    const viewport = page.viewportSize();
    if (viewport && viewport.width >= 1024) {
      const nav = page.getByRole('navigation', { name: /main navigation/i });
      await expect(nav).toBeVisible();

      // Collapse button has aria-label and aria-expanded
      const collapseBtn = page.getByRole('button', {
        name: /collapse sidebar|expand sidebar/i,
      });
      await expect(collapseBtn).toBeVisible();
      await expect(collapseBtn).toHaveAttribute('aria-expanded');
    }
  });

  test('create event form labels are associated with inputs', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#login-email').fill('admin@edutrack.org');
    await page.locator('#login-password').fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/home/, { timeout: 10000 });

    await page.goto('/events/create');
    // Labels use htmlFor matching input ids
    await expect(page.getByLabel(/event title/i)).toBeVisible();
    await expect(page.getByLabel(/description/i)).toBeVisible();
    await expect(page.getByLabel(/location/i)).toBeVisible();
    await expect(page.getByLabel(/start date/i)).toBeVisible();
    await expect(page.getByLabel(/end date/i)).toBeVisible();
  });
});
