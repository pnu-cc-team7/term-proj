import { test, expect, type Page } from '@playwright/test';

/**
 * Helper to perform a mock login using the 'code' query parameter
 */
async function performLogin(page: Page) {
  console.log('--- Helper: Performing Mock Login ---');
  // Use no-mock=true to ensure we hit Playwright routes, not MSW
  await page.goto('/?code=mock-auth-code&no-mock=true');
  const logoutButton = page.getByRole('button', { name: 'Logout' });
  await expect(logoutButton).toBeVisible({ timeout: 15000 });
}

test.describe('Authentication Guard - Guest Access', () => {
  test.beforeEach(async ({ page }) => {
    // Mock votes for guest
    await page.route('**/votes', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ 
          id: 'guest-vote-1', 
          title: 'Public Vote', 
          status: 'open', 
          options: [{id: 'opt1', name: 'Opt 1'}] 
        }])
      });
    });
  });

  test('should show login prompt when guest accesses Create tab', async ({ page }) => {
    await page.goto('/?no-mock=true');
    await page.getByText('Create', { exact: true }).click();
    
    // Check for the lock icon and Login Required message
    await expect(page.locator('text=Login Required')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login with Kakao' })).toBeVisible();
  });

  test('should show alert and block participation when guest clicks a vote', async ({ page }) => {
    await page.goto('/?no-mock=true');
    await page.getByText('Explore', { exact: true }).click();
    
    const voteCard = page.locator('.sketch-box').filter({ hasText: 'Public Vote' }).first();
    await expect(voteCard).toBeVisible({ timeout: 10000 });
    
    // Set up dialog handler BEFORE the click
    page.once('dialog', async dialog => {
      console.log(`[DIALOG] Caught expected alert: ${dialog.message()}`);
      expect(dialog.message()).toContain('Please log in');
      await dialog.dismiss();
    });

    // We don't await the click because the alert blocks it
    await voteCard.click();

    // Verify we didn't navigate to the vote swiping view
    await expect(page.locator('.swipe-card')).not.toBeVisible();
  });
});

test.describe('Authentication Guard - Authenticated Access', () => {
  test.beforeEach(async ({ page }) => {
    // API Mocking for Auth
    await page.route('**/auth/kakao', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id: 'user-1', kakaoId: 'kakao-1' } })
      });
    });

    // API Mocking for Votes
    await page.route('**/votes', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([{ 
            id: 'auth-vote-1', 
            title: 'Member Only Vote', 
            status: 'open', 
            options: [{id: 'opt1', name: 'Sushi'}] 
          }])
        });
      }
    });
    
    // Auto-dismiss any unexpected alerts
    page.on('dialog', dialog => dialog.dismiss());
  });

  test('should allow access to Create form after login', async ({ page }) => {
    await performLogin(page);
    await page.getByText('Create', { exact: true }).click();
    
    // Form should be visible
    await expect(page.locator('input[placeholder*="lunch today?"]')).toBeVisible();
  });

  test('should allow participation in votes after login', async ({ page }) => {
    await performLogin(page);
    await page.getByText('Explore', { exact: true }).click();
    
    const voteCard = page.locator('.sketch-box').filter({ hasText: 'Member Only Vote' }).first();
    await expect(voteCard).toBeVisible();

    await voteCard.click();
    
    // Swipe card should appear
    await expect(page.locator('.swipe-card')).toBeVisible({ timeout: 10000 });
  });
});
