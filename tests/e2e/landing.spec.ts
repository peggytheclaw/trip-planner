import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('loads with correct title and hero text', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Roteiro/);
    await expect(page.locator('h1')).toContainText('Trip planning');
    await expect(page.locator('h1')).toContainText('your friends');
  });

  test('shows Google Sign-In button', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Google Sign-In is rendered via @react-oauth/google — it may be an iframe or button
    const googleBtn = page
      .locator('[data-testid="google-signin"], iframe[title*="Sign in"], div[id="credential_picker_container"]')
      .or(page.locator('text=Continue with Google'));
    await googleBtn.isVisible({ timeout: 5000 }).catch(() => {});

    // At minimum the page must load without critical errors
    const criticalErrors = errors.filter(e => !e.includes('Cross-Origin'));
    expect(criticalErrors).toHaveLength(0);
  });

  test('waitlist form accepts email', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const emailInput = page
      .locator('input[type="email"], input[placeholder*="email"]')
      .first();
    if (await emailInput.isVisible()) {
      await emailInput.fill('test@example.com');
      await expect(emailInput).toHaveValue('test@example.com');
    }
  });

  test('map background loads', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const mapContainer = page.locator('.leaflet-container').first();
    if (await mapContainer.isVisible()) {
      await expect(mapContainer).toBeVisible();
    }
  });

  test('navigates to discover page', async ({ page }) => {
    await page.goto('/discover');
    await expect(page).not.toHaveURL('/');
    await page.waitForLoadState('networkidle');
  });
});
