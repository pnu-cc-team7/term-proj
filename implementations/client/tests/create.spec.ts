import { test, expect } from '@playwright/test';

test.describe('Vote Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // 브라우저 콘솔 로그 출력
    page.on('console', msg => console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`));

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

    // Kakao Map SDK 모킹 (장소 검색 시뮬레이션)
    await page.addInitScript(() => {
      const mockKakao = {
        maps: {
          load: (cb: any) => {
            console.log('[MOCK SDK] maps.load called');
            setTimeout(cb, 10);
          },
          LatLng: function(lat: number, lng: number) {
            return { getLat: () => lat, getLng: () => lng };
          },
          services: {
            Places: function() {
              return {
                keywordSearch: (keyword: string, callback: any) => {
                  console.log(`[MOCK SDK] keywordSearch called for: ${keyword}`);
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
      (window as any).kakao = mockKakao;
      
      // 진짜 SDK가 전역 변수를 덮어쓰지 못하도록 고정
      Object.defineProperty(window, 'kakao', {
        get: () => mockKakao,
        set: () => { console.log('[MOCK] Attempt to overwrite window.kakao ignored'); },
        configurable: true
      });
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

    // 2. 'Create New Vote' 버튼 클릭
    console.log('--- Step 1: Navigating to Create Tab ---');
    await page.getByRole('button', { name: 'Create New Vote' }).click();
    await expect(page.locator('h2')).toContainText('New Food Vote');

    // 3. 투표 제목 입력
    console.log('--- Step 2: Entering Title ---');
    await page.fill('input[placeholder*="lunch today?"]', '동료들과 점심 회식');

    // 4. 장소 검색 및 추가
    console.log('--- Step 3: Searching for Places ---');
    const searchInput = page.locator('input[placeholder="Search places..."]');
    await searchInput.fill('피자');
    await page.click('button:has-text("Search")');
    await page.locator('text=맛있는 피자집').first().click();

    await searchInput.fill('떡볶이');
    await page.keyboard.press('Enter');
    await page.locator('text=매콤한 떡볶이').click();

    // 5. 투표 발행 (알림창 명시적 처리)
    console.log('--- Step 4: Publishing Vote ---');
    const publishBtn = page.getByRole('button', { name: 'Create Vote' });
    
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
