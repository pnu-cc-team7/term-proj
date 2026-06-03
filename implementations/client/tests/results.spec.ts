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

    // 백엔드 API 모킹: 인증
    await page.route('**/auth/kakao', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id: 'test-user', kakaoId: '123' } })
      });
    });

    // API 모킹: 투표 목록
    await page.route(url => url.pathname.endsWith('/votes'), async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'test-vote-123',
              title: '점심 메뉴 결정',
              status: 'open',
              options: [
                { id: 'opt1', name: '김치찌개', lat: 37.123, lng: 127.123 },
                { id: 'opt2', name: '돈까스', lat: 37.124, lng: 127.124 }
              ]
            }
          ])
        });
      } else {
        // 투표 생성 등 POST 요청은 성공 응답
        await route.fulfill({ status: 201, body: JSON.stringify({ id: 'new-id' }) });
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

    // API 모킹: 투표 결과
    await page.route(url => url.pathname.includes('/results'), async route => {
      console.log(`[PLAYWRIGHT MOCK] Intercepted Results: ${route.request().url()}`);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalVotes: 25,
          options: [
            { optionId: 'opt1', name: '김치찌개', count: 18 },
            { optionId: 'opt2', name: '돈까스', count: 7 }
          ]
        })
      });
    });
  });

  test('should navigate to results page and display mocked data', async ({ page }) => {
    console.log('--- Step 1: Navigating to App ---');
    await page.goto('/?no-mock=true');

    // 1.5 메인 버튼 클릭하여 목록 이동
    console.log('--- Step 1.5: Clicking Find Votes ---');
    await page.getByRole('button', { name: 'Find Votes' }).click();

    // 2. 투표 카드 로드 대기 및 클릭
    console.log('--- Step 2: Selecting Vote Card ---');
    const voteCard = page.locator('.sketch-box').filter({ hasText: '점심 메뉴 결정' }).first();
    await expect(voteCard).toBeVisible({ timeout: 10000 });
    await voteCard.click();

    // 3. 스와이프 (카드가 사라질 때까지 반복)
    console.log('--- Step 3: Swiping cards ---');
    for(let i=0; i<2; i++) {
        const card = page.locator('.swipe-card').first();
        await expect(card).toBeVisible({ timeout: 5000 });
        
        const box = await card.boundingBox();
        if (box) {
          // 오른쪽으로 스와이프 (LIKE)
          await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
          await page.mouse.down();
          await page.mouse.move(box.x + box.width + 400, box.y + box.height / 2); // 아주 길게 드래그
          await page.mouse.up();
          await page.waitForTimeout(800); // 렌더링 애니메이션 대기
        }
    }

    // 4. 모든 스와이프 완료 후 자동으로 결과 페이지로 이동됨
    console.log('--- Step 4: Verifying Automatic Navigation to Results ---');
    
    // 5. 최종 결과 검증
    console.log('--- Step 5: Verifying Final Results Data ---');
    const resultsHeader = page.locator('h2');
    await expect(resultsHeader).toContainText('Results: 점심 메뉴 결정', { timeout: 15000 });
    
    await expect(page.locator('h4')).toContainText('김치찌개');
    await expect(page.locator('.scribble-text')).toContainText('Total 25 people participated!');
    console.log('--- Test: Success! Results are correctly displayed ---');
  });
});
