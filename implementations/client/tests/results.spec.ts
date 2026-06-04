import { test, expect } from '@playwright/test';

test.describe('Vote Results Flow', () => {
  test.beforeEach(async ({ page }) => {
    // 브라우저 콘솔 로그 출력
    page.on('console', msg => console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`));
    
    // 알림창(alert) 자동 닫기
    page.on('dialog', async dialog => {
      console.log(`[DIALOG] ${dialog.type()}: ${dialog.message()}`);
      await dialog.dismiss();
    });

    // Kakao SDK 관련 네트워크 요청 차단 및 가짜 스크립트 반환
    await page.route('**/*kakao.com/v2/maps/sdk.js*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'text/javascript',
        body: 'console.log("[MOCK] Kakao Maps SDK script loaded");'
      });
    });
    await page.route('**/*kakao.com/**', route => route.abort());
    await page.route('**/*kakaocdn.net/**', route => route.abort());

    // Kakao Map SDK 모킹
    await page.addInitScript(() => {
      const mockKakao = {
        maps: {
          load: (cb: () => void) => setTimeout(cb, 10),
          LatLng: function(lat: number, lng: number) {
            return { getLat: () => lat, getLng: () => lng };
          },
          services: {
            Places: function() { return { keywordSearch: () => {} }; },
            Status: { OK: 'OK' }
          }
        }
      };
      Object.defineProperty(window, 'kakao', { get: () => mockKakao, set: () => {}, configurable: true });
    });

    // 백엔드 API 모킹: 인증
    await page.route('**/auth/kakao', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id: 'test-user', kakaoId: '123' } })
      });
    });

    // API 모킹: 투표 목록
    await page.route('**/votes', async route => {
      if (route.request().method() === 'GET') {
        console.log(`[PLAYWRIGHT MOCK] Intercepted Votes List: ${route.request().url()}`);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'test-vote-123',
              title: '점심 메뉴 결정',
              status: 'open',
              options: [
                { id: 'opt1', name: '김치찌개', lat: 35.1, lng: 129.1 }
              ]
            }
          ])
        });
      }
    });

    // API 모킹: 투표 참여
    await page.route('**/participate', async route => {
      console.log(`[PLAYWRIGHT MOCK] Intercepted Participation: ${route.request().url()}`);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Success' })
      });
    });

    // API 모킹: 결과 조회
    await page.route('**/results', async route => {
      console.log(`[PLAYWRIGHT MOCK] Intercepted Results: ${route.request().url()}`);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalVotes: 10,
          options: [
            { id: 1, name: '김치찌개', count: 7 },
            { id: 2, name: '된장찌개', count: 3 }
          ]
        })
      });
    });
  });

  test('should participate in a vote and see results', async ({ page }) => {
    console.log('--- Step 1: Navigating to App ---');
    await page.goto('/?no-mock=true');

    // 1.5 메인 버튼 클릭하여 목록 이동
    console.log('--- Step 1.5: Clicking Find Votes ---');
    await page.getByRole('button', { name: 'Find Votes' }).click();

    // 2. 투표 카드 로드 대기 및 클릭
    console.log('--- Step 2: Selecting Vote Card ---');
    const voteCard = page.locator('.sketch-box').filter({ hasText: '점심 메뉴 결정' }).first();
    await expect(voteCard).toBeVisible({ timeout: 10000 });
    // 카드 바디를 클릭하여 투표 시작
    await voteCard.locator('div').first().click();

    // 3. 스와이프
    console.log('--- Step 3: Swiping card ---');
    const card = page.locator('.swipe-card').first();
    await expect(card).toBeVisible({ timeout: 5000 });
    
    const box = await card.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width + 400, box.y + box.height / 2);
      await page.mouse.up();
    }

    // 4. 스와이프 완료 후 자동으로 결과 페이지로 이동됨
    console.log('--- Step 4: Verifying Results Page ---');
    const resultHeader = page.locator('p.scribble-text', { hasText: 'Real-time Voting Standings' });
    await expect(resultHeader).toBeVisible({ timeout: 10000 });
    
    // 결과 데이터 확인 (70% 바 차트 등)
    const resultItem = page.locator('.result-item').filter({ hasText: '김치찌개' });
    await expect(resultItem).toContainText('7 votes (70%)');
    
    console.log('--- Test: Success! Voted and saw results ---');
  });

  test('should view results directly from the list', async ({ page }) => {
    await page.goto('/?no-mock=true');
    await page.getByRole('button', { name: 'Find Votes' }).click();

    console.log('--- Clicking View Standings button ---');
    await page.getByText('View Standings →').first().click();

    console.log('--- Verifying Results Page ---');
    const resultHeader = page.locator('p.scribble-text', { hasText: 'Real-time Voting Standings' });
    await expect(resultHeader).toBeVisible({ timeout: 10000 });
    
    await expect(page.locator('.result-name', { hasText: '김치찌개' })).toBeVisible();
    
    console.log('--- Test: Success! Viewed results directly ---');
  });
});
