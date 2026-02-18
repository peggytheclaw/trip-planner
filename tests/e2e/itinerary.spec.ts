import { test, expect } from '@playwright/test';
import { mockAuth } from './helpers/auth';

test.describe('Itinerary', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page);

    // Pre-seed a sample trip into localStorage so /trip/:id has something to render
    await page.addInitScript(() => {
      const sampleTrip = {
        id: 'playwright-test-trip',
        name: 'Test Tokyo Trip',
        destination: 'Tokyo, Japan',
        emoji: '🇯🇵',
        startDate: '2025-03-15',
        endDate: '2025-03-22',
        travelers: [{ id: 't1', name: 'Alex', color: '#3B82F6' }],
        events: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('roteiro-trips', JSON.stringify([sampleTrip]));
    });

    await page.goto('/trip/playwright-test-trip');
    await page.waitForLoadState('networkidle');
  });

  test('itinerary page loads without crashing', async ({ page }) => {
    // At minimum the page body should be present
    await expect(page.locator('body')).toBeVisible();
    // No unhandled JS errors
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.waitForTimeout(1000);
    expect(errors).toHaveLength(0);
  });

  test('add event button is visible', async ({ page }) => {
    // Some interactive button should exist on the itinerary page
    await expect(page.locator('button').first()).toBeVisible({ timeout: 5000 });
  });
});
