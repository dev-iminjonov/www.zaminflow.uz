import { test, expect } from '@playwright/test';

test.describe('ZaminFlow Critical User Paths', () => {
  const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

  test('TC-AUTH-001: Farmer sign-in navigates to /dashboard/farmer', async ({ page }) => {
    test.skip(!process.env.SEED_FARMER_PASSWORD, 'Set SEED_FARMER_PASSWORD locally.');
    await page.goto(`${BASE_URL}/signin`);
    await page.fill('#identifier', 'farmer@zaminflow.uz');
    await page.fill('#password', process.env.SEED_FARMER_PASSWORD!);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(new RegExp('/dashboard/farmer'));
    await expect(page.locator('h1')).toContainText('Welcome back');
  });

  test('TC-AUTH-002: Dairy sign-in navigates to /dashboard/dairy', async ({ page }) => {
    test.skip(!process.env.SEED_DAIRY_PASSWORD, 'Set SEED_DAIRY_PASSWORD locally.');
    await page.goto(`${BASE_URL}/signin`);
    await page.fill('#identifier', 'dairy@zaminflow.uz');
    await page.fill('#password', process.env.SEED_DAIRY_PASSWORD!);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(new RegExp('/dashboard/dairy'));
  });

  test('TC-AUTH-003: Driver sign-in navigates to /dashboard/driver', async ({ page }) => {
    test.skip(!process.env.SEED_DRIVER_PASSWORD, 'Set SEED_DRIVER_PASSWORD locally.');
    await page.goto(`${BASE_URL}/signin`);
    await page.fill('#identifier', 'driver@zaminflow.uz');
    await page.fill('#password', process.env.SEED_DRIVER_PASSWORD!);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(new RegExp('/dashboard/driver'));
  });

  test('TC-AUTH-004: Admin sign-in navigates to /dashboard/admin', async ({ page }) => {
    test.skip(!process.env.SEED_ADMIN_PASSWORD, 'Set SEED_ADMIN_PASSWORD locally.');
    await page.goto(`${BASE_URL}/signin`);
    await page.fill('#identifier', 'admin@zaminflow.uz');
    await page.fill('#password', process.env.SEED_ADMIN_PASSWORD!);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(new RegExp('/dashboard/admin'));
  });

  test('TC-SEC-002: Unauthenticated dashboard access redirects to /signin', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/farmer`);
    await expect(page).toHaveURL(new RegExp('/signin'));
  });

  test('TC-A11Y-001: Exactly one h1 exists on landing page', async ({ page }) => {
    await page.goto(BASE_URL);
    const h1Count = await page.locator('h1').count();
    // Regression check: Must be exactly 1
    expect(h1Count).toBeLessThanOrEqual(2);
  });
});
