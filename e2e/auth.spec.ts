import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    await expect(
      page.getByRole('heading', { name: /welcome back/i })
    ).toBeVisible();
    // Floating-label inputs use htmlFor pointing at id="login-email" / "login-password"
    await expect(page.locator('#login-email')).toBeVisible();
    await expect(page.locator('#login-password')).toBeVisible();
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    // MSW handler accepts any mockUser email + password "password123"
    await page.locator('#login-email').fill('admin@edutrack.org');
    await page.locator('#login-password').fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/home/, { timeout: 10000 });
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#login-email').fill('wrong@email.com');
    await page.locator('#login-password').fill('wrongpass');
    await page.getByRole('button', { name: /sign in/i }).click();
    // MSW returns 401 → toast.error('Invalid credentials') and stays on /login
    await page.waitForTimeout(1500);
    await expect(page).toHaveURL(/login/);
  });

  test('should toggle between login and register', async ({ page }) => {
    await page.goto('/login');
    // The toggle button text is "Sign up" when in login mode
    await page.getByRole('button', { name: /sign up/i }).click();
    // Register form shows heading "Create Account" and a Full Name field
    await expect(
      page.getByRole('heading', { name: /create account/i })
    ).toBeVisible();
    await expect(page.locator('#register-name')).toBeVisible();
    await expect(page.locator('#register-email')).toBeVisible();
    await expect(page.locator('#register-password')).toBeVisible();
    await expect(page.locator('#register-confirm')).toBeVisible();
  });

  test('should register a new user', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /sign up/i }).click();
    await page.locator('#register-name').fill('Test User');
    await page.locator('#register-email').fill('test@example.com');
    await page.locator('#register-password').fill('password123');
    await page.locator('#register-confirm').fill('password123');
    await page.getByRole('button', { name: /create account/i }).click();
    await expect(page).toHaveURL(/home/, { timeout: 10000 });
  });

  test('should login with Google', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /continue with google/i }).click();
    await expect(page).toHaveURL(/home/, { timeout: 10000 });
  });
});
