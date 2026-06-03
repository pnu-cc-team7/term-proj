const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('--- Playwright: Starting Redirect Test ---');

  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE] ${msg.type().toUpperCase()}: ${msg.text()}`);
  });

  try {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    console.log('--- Playwright: Current URL:', page.url());

    // 로그인 버튼 클릭
    console.log('--- Playwright: Clicking KAKAO LOGIN button ---');
    
    // 리다이렉트 대기
    const [response] = await Promise.all([
      page.waitForNavigation({ url: /kauth\.kakao\.com/, timeout: 10000 }).catch(e => {
          console.log('--- Playwright: Navigation to Kakao timed out or failed, checking current URL instead.');
          return null;
      }),
      page.click('button:has-text("KAKAO LOGIN")')
    ]);

    console.log('--- Playwright: Final URL after click:', page.url());

    if (page.url().includes('kauth.kakao.com')) {
      console.log('✅ SUCCESS: Redirect to Kakao Login page confirmed!');
    } else {
      console.log('❌ FAILURE: Redirect failed. Still on:', page.url());
      await page.screenshot({ path: 'redirect-failure.png' });
    }

  } catch (err) {
    console.error('--- Playwright: Error during execution ---', err);
  } finally {
    await browser.close();
    console.log('--- Playwright: Finished ---');
  }
})();
