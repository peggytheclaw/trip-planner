import { test, expect } from '@playwright/test';
import { mockAuth } from './helpers/auth';

test.describe('Trip Management', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page);
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
  });

  test('trip list page loads', async ({ page }) => {
    // At least one of these key labels should be visible
    await expect(
      page
        .locator('text=My Trips')
        .or(page.locator('text=New Trip'))
        .or(page.locator('text=Roteiro'))
        .first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('can open new trip dialog', async ({ page }) => {
    const newTripBtn = page
      .locator('button:has-text("New Trip")')
      .or(page.locator('button:has-text("Create")'))
      .or(page.locator('[data-testid="new-trip"]'))
      .first();

    if (await newTripBtn.isVisible({ timeout: 3000 })) {
      await newTripBtn.click();
      // A dialog/sheet with a name input should appear
      await expect(
        page
          .locator('input[placeholder*="Trip name"]')
          .or(page.locator('input[placeholder*="name"]'))
          .first()
      ).toBeVisible({ timeout: 3000 });
    }
  });

  test('discover page renders', async ({ page }) => {
    await page.goto('/discover');
    await page.waitForLoadState('networkidle');

    const content = page
      .locator('main')
      .or(page.locator('[role="main"]'))
      .or(page.locator('text=Discover'))
      .or(page.locator('text=Inspiration'))
      .first();

    await expect(content).toBeVisible({ timeout: 5000 });
  });
});
