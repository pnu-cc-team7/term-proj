import { test, expect } from '@playwright/test';

test('debug auth cookies on prod', async ({ page }) => {
  page.on('console', msg => console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`));
  
  console.log('--- Navigating to Production ---');
  await page.goto('https://pnu-team7-prod.duckdns.org');
  
  // Trigger a dummy auth call to see response headers
  console.log('--- Triggering dummy /auth/kakao ---');
  const response = await page.request.post('https://pnu-team7-prod.duckdns.org/auth/kakao', {
    data: { code: 'dummy' }
  });
  
  console.log('Response Status:', response.status());
  console.log('Response Headers:', JSON.stringify(response.headers(), null, 2));
  
  const cookies = await page.context().cookies();
  console.log('Context Cookies after call:', JSON.stringify(cookies, null, 2));
});

test('debug auth cookies on staging', async ({ page }) => {
  console.log('--- Navigating to Staging ---');
  await page.goto('http://pnu-team7-stage.duckdns.org');
  
  console.log('--- Triggering dummy /auth/kakao ---');
  const response = await page.request.post('http://pnu-team7-stage.duckdns.org/auth/kakao', {
    data: { code: 'dummy' }
  });
  
  console.log('Staging Response Status:', response.status());
  console.log('Staging Response Headers:', JSON.stringify(response.headers(), null, 2));
});
