import { test, expect } from '@playwright/test';

test.describe('Multi-Swipe Voting Flow', () => {
  test.beforeEach(async ({ page }) => {
    // 알림창(alert) 자동 닫기
    page.on('dialog', async dialog => {
      console.log(`[DIALOG] ${dialog.type()}: ${dialog.message()}`);
      await dialog.dismiss();
    });

    // Kakao SDK 모킹 (간소화)
    await page.route('**/*kakao.com/**', async route => {
      await route.fulfill({ status: 200, contentType: 'text/javascript', body: '' });
    });

    // 백엔드 API 모킹
    await page.route('**/votes', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'vote-1',
              title: 'Multi Swipe Test',
              options: [
                { id: 'opt1', name: 'Option 1' },
                { id: 'opt2', name: 'Option 2' },
                { id: 'opt3', name: 'Option 3' }
              ]
            }
          ])
        });
      }
    });

    await page.route('**/participate', async route => {
      console.log(`[API CALL] Participate with: ${route.request().postData()}`);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Success' })
      });
    });
  });

  test('should allow multiple YES swipes and only submit the last one', async ({ page }) => {
    await page.goto('/?no-mock=true');
    await page.getByRole('button', { name: 'Find Votes' }).click();
    await page.locator('.sketch-box').filter({ hasText: 'Multi Swipe Test' }).first().click();

    // 1번째 카드: YES (오른쪽)
    console.log('--- Swiping RIGHT on Option 1 ---');
    await swipe(page, 'right');
    await expect(page.locator('h3', { hasText: 'Option 2' })).toBeVisible();

    // 2번째 카드: YES (오른쪽)
    console.log('--- Swiping RIGHT on Option 2 ---');
    await swipe(page, 'right');
    await expect(page.locator('h3', { hasText: 'Option 3' })).toBeVisible();

    // 3번째 카드: YES (오른쪽) - 마지막 카드
    console.log('--- Swiping RIGHT on Option 3 ---');
    
    // API 호출 감시
    const apiCallPromise = page.waitForRequest(request => 
      request.url().includes('participate') && 
      request.method() === 'POST'
    );

    await swipe(page, 'right');

    const finalRequest = await apiCallPromise;
    const postData = JSON.parse(finalRequest.postData() || '{}');
    console.log(`--- Final Vote Submitted: ${postData.optionId} ---`);
    
    // 마지막 YES인 opt3가 전송되어야 함
    expect(postData.optionId).toBe('opt3');

    // 결과 확인
    await expect(page.locator('h2', { hasText: 'Active Votes' })).toBeVisible();
  });
});

async function swipe(page: any, direction: 'left' | 'right') {
  const card = page.locator('.swipe-card').first();
  const box = await card.boundingBox();
  if (box) {
    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;
    const endX = direction === 'right' ? startX + 400 : startX - 400;
    
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(endX, startY, { steps: 10 });
    await page.mouse.up();
    // 애니메이션 대기
    await page.waitForTimeout(500);
  }
}
