import { test, expect } from '@playwright/test';

test.describe('Performance', () => {
  test('landing page loads in under 5 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - start;
    expect(loadTime).toBeLessThan(5000);
  });

  test('no critical console errors on landing page', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const criticalErrors = errors.filter(
      e =>
        !e.includes('Cross-Origin') &&
        !e.includes('postMessage') &&
        !e.includes('runtime.lastError')
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test('discover page loads in under 5 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto('/discover');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - start;
    expect(loadTime).toBeLessThan(5000);
  });
});
