import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('unauthenticated users are redirected from /app to /', async ({ page }) => {
    await page.goto('/app');
    await page.waitForURL('/');
    await expect(page).toHaveURL('/');
  });

  test('unauthenticated users are redirected from /trip/123 to /', async ({ page }) => {
    await page.goto('/trip/some-trip-id');
    await page.waitForURL('/');
    await expect(page).toHaveURL('/');
  });

  test('share view is publicly accessible without auth', async ({ page }) => {
    await page.goto('/trip/any-trip-id/share');
    // Share view is public — should NOT redirect to /
    await page.waitForLoadState('networkidle');
    await expect(page).not.toHaveURL('/');
  });

  test('404 page shows for unknown routes', async ({ page }) => {
    await page.goto('/this-does-not-exist');
    await expect(page.locator('text=Page not found')).toBeVisible({ timeout: 5000 });
  });
});
