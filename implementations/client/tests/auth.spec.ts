import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // 브라우저 콘솔 로그를 터미널에 출력
    page.on('console', msg => console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`));
    
    // 모든 네트워크 요청 로그 (디버깅용)
    page.on('request', request => {
      if (request.url().includes('auth') || request.url().includes('votes')) {
        console.log(`[NETWORK] Request: ${request.method()} ${request.url()}`);
      }
    });

    // 알림창(alert) 자동 닫기
    page.on('dialog', async dialog => {
      console.log(`[DIALOG] ${dialog.type()}: ${dialog.message()}`);
      await dialog.dismiss();
    });

    // 백엔드 API 모킹: 인증
    await page.route('**/auth/kakao', async route => {
      console.log(`[PLAYWRIGHT MOCK] Intercepted: ${route.request().url()}`);
      const origin = route.request().headers()['origin'] || 'http://localhost:5173';
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id: 'kakao:test-123', kakaoId: 'test-123' }
        }),
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Credentials': 'true',
          'Set-Cookie': 'token=test-jwt-token; Path=/; HttpOnly; Secure; SameSite=None'
        }
      });
    });

    // 백엔드 API 모킹: 투표 목록 (에러 방지용)
    await page.route('**/votes', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });
  });

  test('should show login button and handle bypass code', async ({ page }) => {
    // 1. 페이지 접속 (인가 코드 + 모킹 비활성화 파라미터 추가)
    console.log('--- Test: Navigating to page ---');
    await page.goto('/?code=dev-success&no-mock=true');

    // 2. 타이틀 확인
    await expect(page).toHaveTitle(/Gourmet Social/);

    // 3. 로그아웃 버튼이 나타날 때까지 대기
    console.log('--- Test: Waiting for Logout button ---');
    const logoutButton = page.getByRole('button', { name: 'Logout' });
    await expect(logoutButton).toBeVisible({ timeout: 15000 });
    console.log('--- Test: Success! Logout button is visible ---');
  });

  test('should show kakao login button by default', async ({ page }) => {
    await page.goto('/');
    const loginButton = page.getByRole('button', { name: 'Kakao Login' });
    await expect(loginButton).toBeVisible();
  });
});
