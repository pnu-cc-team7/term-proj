import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should show login button and handle bypass code', async ({ page }) => {
    // 1. 페이지 접속 (인가 코드를 물고 성공 시나리오 테스트)
    await page.goto('/?code=dev-success');

    // 2. 타이틀 확인
    await expect(page).toHaveTitle(/Gourmet Social/);

    // 3. 로그아웃 버튼이 나타날 때까지 대기 (백엔드 연동 성공 의미)
    const logoutButton = page.getByRole('button', { name: 'LOGOUT' });
    await expect(logoutButton).toBeVisible({ timeout: 10000 });
  });

  test('should show kakao login button by default', async ({ page }) => {
    await page.goto('/');
    const loginButton = page.getByRole('button', { name: 'KAKAO LOGIN' });
    await expect(loginButton).toBeVisible();
  });
});
