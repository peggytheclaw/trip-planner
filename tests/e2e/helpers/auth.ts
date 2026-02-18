import { Page } from '@playwright/test';

export const SUPABASE_URL = 'https://hwtgsrxdqiumiwlzfsnq.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3dGdzcnhkcWl1bWl3bHpmc25xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNjU3MTUsImV4cCI6MjA4Njk0MTcxNX0.zmWrYp2V1URfLlA-fwG3cDCceHG9OvuwdH7BQGvDabY';

/**
 * Mock auth by injecting a fake session into localStorage and the global window,
 * so the Supabase client and Zustand authStore both see an authenticated user.
 * Must be called BEFORE page.goto().
 */
export async function mockAuth(page: Page) {
  await page.addInitScript(() => {
    const mockUser = {
      id: 'test-user-id-playwright',
      email: 'playwright@test.com',
      user_metadata: { full_name: 'Playwright Tester', avatar_url: '' },
      app_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    };

    const mockSession = {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      token_type: 'bearer',
      user: mockUser,
    };

    // Supabase v2 localStorage key
    localStorage.setItem(
      'sb-hwtgsrxdqiumiwlzfsnq-auth-token',
      JSON.stringify({
        currentSession: mockSession,
        expiresAt: Date.now() / 1000 + 3600,
      })
    );

    // Signal to authStore.initialize() to skip real Supabase call
    (window as any).__PLAYWRIGHT_MOCK_USER__ = mockUser;
  });
}
