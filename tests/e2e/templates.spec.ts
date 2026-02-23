import { test, expect } from '@playwright/test';

/**
 * Template Share View Tests
 * Ensures that sample/template trips are viewable via their share URLs
 * without requiring Supabase or authentication.
 */

const TEMPLATE_IDS = [
  'tokyo-2025-demo',           // sampleTrip
  'template-nyc-weekend',      // nycTemplate
  'template-euro-backpacking', // euroTemplate
  'template-bali-retreat',     // baliTemplate
  'template-amalfi-coast',     // amalfiTemplate
  'template-patagonia-trek',   // patagoniaTemplate
  'template-morocco-medinas',  // moroccoTemplate
  'template-iceland-ring-road',// icelandTemplate
  'template-thailand-island-hop', // thailandTemplate
];

test.describe('Template Share Views', () => {
  for (const templateId of TEMPLATE_IDS) {
    test(`template ${templateId} loads without "Trip not found" error`, async ({ page }) => {
      // Navigate to the template share view
      await page.goto(`/trip/${templateId}/share`);

      // Wait for content to load (should be fast since it's in-memory)
      await page.waitForLoadState('networkidle');

      // Ensure "Trip not found" error does NOT appear
      const notFoundText = page.locator('text=Trip not found');
      await expect(notFoundText).not.toBeVisible();

      // Verify the Roteiro branding is visible (indicates page loaded correctly)
      const roteiroLogo = page.locator('text=Roteiro').first();
      await expect(roteiroLogo).toBeVisible();

      // Verify the page title is NOT "Trip not found"
      const pageTitle = await page.title();
      expect(pageTitle).not.toContain('Trip not found');

      // Verify at least one event card or timeline element is present
      // (all templates have events)
      const hasEvents = (
        (await page.locator('[data-testid="event-card"]').count()) > 0 ||
        (await page.locator('text=/DAY \\d+/').count()) > 0
      );
      expect(hasEvents).toBeTruthy();
    });
  }

  test('template share view shows trip name and destination', async ({ page }) => {
    // Use Tokyo sample as representative test
    await page.goto('/trip/tokyo-2025-demo/share');
    await page.waitForLoadState('networkidle');

    // Should show trip name
    await expect(page.locator('text=/Tokyo Adventure|Tokyo/i').first()).toBeVisible();

    // Should show destination
    await expect(page.locator('text=/Japan|Tokyo/i').first()).toBeVisible();
  });

  test('template share view is publicly accessible (no auth redirect)', async ({ page }) => {
    await page.goto('/trip/template-amalfi-coast/share');
    await page.waitForLoadState('networkidle');

    // Should stay on share route, not redirect to /
    expect(page.url()).toContain('/trip/template-amalfi-coast/share');
    
    // Should not show login/auth prompt
    const signInButton = page.locator('text=/sign in|log in/i');
    await expect(signInButton).not.toBeVisible();
  });
});
