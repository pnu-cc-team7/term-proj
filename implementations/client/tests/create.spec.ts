import { test, expect } from '@playwright/test';

test.describe('Vote Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // 브라우저 콘솔 로그 출력
    page.on('console', msg => console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`));

    // Kakao Map SDK 모킹 (장소 검색 시뮬레이션)
    await page.addInitScript(() => {
      (window as any).kakao = {
        maps: {
          services: {
            Places: function() {
              return {
                keywordSearch: (keyword: string, callback: any) => {
                  console.log(`[MOCK SDK] Searching for: ${keyword}`);
                  const mockData = [
                    { id: '1', place_name: '맛있는 피자집', address_name: '서울시 강남구', x: '127.1', y: '37.1' },
                    { id: '2', place_name: '매콤한 떡볶이', address_name: '서울시 서초구', x: '127.2', y: '37.2' }
                  ];
                  callback(mockData, 'OK');
                }
              };
            },
            Status: { OK: 'OK' }
          }
        }
      };
    });

    // API 모킹: 투표 (GET/POST)
    await page.route('**/votes', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
      } else if (route.request().method() === 'POST') {
        console.log(`[PLAYWRIGHT MOCK] Intercepted Vote Creation: ${route.request().url()}`);
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ id: 'new-vote-999' })
        });
      }
    });
  });

  test('should create a new vote with multiple options', async ({ page }) => {
    // 1. 메인 페이지 접속
    await page.goto('/?no-mock=true');

    // 2. 'New Vote' 버튼 클릭
    console.log('--- Step 1: Navigating to Create Tab ---');
    await page.getByRole('button', { name: 'New Vote' }).click();
    await expect(page.locator('h2')).toContainText('New Restaurant Vote');

    // 3. 투표 제목 입력
    console.log('--- Step 2: Entering Title ---');
    await page.fill('input[placeholder*="Best Pizza"]', '동료들과 점심 회식');

    // 4. 장소 검색 및 추가
    console.log('--- Step 3: Searching for Places ---');
    const searchInput = page.locator('input[placeholder="Search restaurant..."]');
    await searchInput.fill('피자');
    await page.click('button:has-text("Search")');
    await page.locator('text=맛있는 피자집').first().click();

    await searchInput.fill('떡볶이');
    await page.keyboard.press('Enter');
    await page.locator('text=매콤한 떡볶이').click();

    // 5. 투표 발행 (알림창 명시적 처리)
    console.log('--- Step 4: Publishing Vote ---');
    const publishBtn = page.getByRole('button', { name: 'Publish Vote' });
    
    // 알림창 대기 및 확인 클릭
    const dialogPromise = page.waitForEvent('dialog');
    await publishBtn.click();
    const dialog = await dialogPromise;
    console.log(`--- Handled Dialog: ${dialog.message()} ---`);
    await dialog.accept();

    // 6. 성공 확인 (리스트 탭으로 자동 이동 검증)
    console.log('--- Step 5: Verifying automatic navigation to list ---');
    
    // 'Active Votes' 제목이 나타나는지 확인
    const listHeader = page.locator('h2', { hasText: 'Active Votes' });
    await expect(listHeader).toBeVisible({ timeout: 15000 });
    
    console.log('--- Test: Success! Vote created and redirected to list ---');
  });
});
