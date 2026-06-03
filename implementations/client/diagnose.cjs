const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('--- Playwright: Starting diagnostics ---');

  // 모든 콘솔 로그 캡처
  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE] ${msg.type().toUpperCase()}: ${msg.text()}`);
  });

  try {
    await page.goto('http://localhost:5173');
    
    // 페이지 로드 대기
    await page.waitForLoadState('networkidle');
    console.log('--- Playwright: Page loaded ---');

    // Kakao 객체 상태 확인
    const kakaoState = await page.evaluate(() => {
      return {
        exists: !!window.Kakao,
        isInitialized: window.Kakao ? window.Kakao.isInitialized() : false,
        keys: window.Kakao ? Object.keys(window.Kakao) : [],
        authExists: !!(window.Kakao && window.Kakao.Auth),
        authKeys: (window.Kakao && window.Kakao.Auth) ? Object.keys(window.Kakao.Auth) : []
      };
    });
    console.log('--- Playwright: Kakao State ---', JSON.stringify(kakaoState, null, 2));

    // 로그인 버튼 클릭 시도
    console.log('--- Playwright: Attempting to click login button ---');
    await page.click('button:has-text("KAKAO LOGIN")');

    // 에러 발생 대기 (잠시 대기)
    await page.waitForTimeout(3000);

    // 스크린샷 캡처 (진단용)
    await page.screenshot({ path: 'diagnostic-screenshot.png' });
    console.log('--- Playwright: Screenshot saved ---');

  } catch (err) {
    console.error('--- Playwright: Error during execution ---', err);
  } finally {
    await browser.close();
    console.log('--- Playwright: Finished ---');
  }
})();
