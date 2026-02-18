import { test, expect } from '@playwright/test';

// Emulate iPhone 14 viewport using Chromium (WebKit not required)
// devices['iPhone 14'] uses WebKit which needs a separate install;
// we replicate the relevant viewport/UA settings here for Chromium-only CI.
test.use({
  viewport: { width: 390, height: 844 },
  userAgent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
  isMobile: true,
  hasTouch: true,
});

test.describe('Mobile Responsiveness', () => {
  test('landing page is mobile-friendly (no horizontal scroll)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    // Allow 5px tolerance
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
  });

  test('landing page body renders on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  test('discover page renders on mobile', async ({ page }) => {
    await page.goto('/discover');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });
});
