import { expect, test } from '@playwright/test';

test.describe('Vote Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.on('console', (message) =>
      console.log(`[BROWSER] ${message.type()}: ${message.text()}`),
    );

    await page.route(/.*kakao\.com\/v2\/maps\/sdk\.js/, async (route) => {
      console.log(`[PLAYWRIGHT MOCK] Fulfilling Kakao SDK: ${route.request().url()}`);
      await route.fulfill({
        status: 200,
        contentType: 'text/javascript',
        body: 'console.log("[MOCK] Kakao Maps SDK script loaded");',
      });
    });

    await page.route(
      (url) =>
        url.hostname.includes('kakao.com') && !url.pathname.includes('sdk.js'),
      (route) => {
        console.log(`[PLAYWRIGHT MOCK] Aborting Kakao request: ${route.request().url()}`);
        route.abort();
      },
    );

    await page.route('**/*kakaocdn.net/**', (route) => route.abort());

    await page.addInitScript(() => {
      type SearchData = Array<Record<string, string>>;
      type SearchCallback = (data: SearchData, status: string) => void;

      const mockData = [
        {
          id: 'place-1',
          place_name: 'Maple Noodles',
          address_name: 'Busan Geumjeong-gu Jangjeon-dong',
          road_address_name: '12 PNU Food Street',
          category_name: 'Food > Restaurant > Noodles',
          distance: '180',
          x: '129.0805',
          y: '35.2341',
        },
        {
          id: 'place-2',
          place_name: 'Green Table',
          address_name: 'Busan Geumjeong-gu Jangjeon-dong',
          road_address_name: '24 PNU Food Street',
          category_name: 'Food > Restaurant > Korean',
          distance: '420',
          x: '129.0812',
          y: '35.2328',
        },
      ];

      const mockMap = {
        setCenter: () => undefined,
        setBounds: () => undefined,
        setLevel: () => undefined,
        relayout: () => undefined,
      };

      const mockKakao = {
        maps: {
          load: (callback: () => void) => window.setTimeout(callback, 10),
          LatLng: function LatLng(lat: number, lng: number) {
            return { getLat: () => lat, getLng: () => lng };
          },
          LatLngBounds: function LatLngBounds() {
            return { extend: () => undefined };
          },
          Map: function Map() {
            return mockMap;
          },
          Marker: function Marker() {
            return {
              setMap: () => undefined,
              setImage: () => undefined,
            };
          },
          MarkerImage: function MarkerImage(src: string) {
            return { src };
          },
          Size: function Size(width: number, height: number) {
            return { width, height };
          },
          Point: function Point(x: number, y: number) {
            return { x, y };
          },
          InfoWindow: function InfoWindow() {
            return {
              open: () => undefined,
              close: () => undefined,
            };
          },
          event: {
            addListener: () => undefined,
          },
          services: {
            Places: function Places() {
              return {
                keywordSearch: (keyword: string, callback: SearchCallback) => {
                  console.log(`[MOCK SDK] keywordSearch called for: ${keyword}`);
                  callback(mockData, 'OK');
                },
              };
            },
            Status: {
              OK: 'OK',
              ZERO_RESULT: 'ZERO_RESULT',
              ERROR: 'ERROR',
            },
          },
        },
      };

      Object.defineProperty(window, 'kakao', {
        get: () => mockKakao,
        set: () => undefined,
        configurable: true,
      });

      Object.defineProperty(navigator, 'geolocation', {
        value: {
          getCurrentPosition: (success: PositionCallback) => {
            success({
              coords: {
                latitude: 35.2338,
                longitude: 129.0799,
                accuracy: 10,
                altitude: null,
                altitudeAccuracy: null,
                heading: null,
                speed: null,
              },
              timestamp: Date.now(),
            });
          },
        },
        configurable: true,
      });
    });

    await page.route('**/auth/kakao', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id: 'user-1', kakaoId: 'kakao-1' } }),
      });
    });

    await page.route('**/votes', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
        return;
      }

      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'new-vote-999' }),
      });
    });
  });

  test('creates a vote from map based restaurant candidates', async ({ page }) => {
    await page.goto('/?code=mock-auth-code&no-mock=true');
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible({
      timeout: 15000,
    });

    await page.getByRole('button', { name: 'Create New Vote' }).click();
    await expect(page.locator('h2')).toContainText('New Food Vote');

    await page
      .getByPlaceholder("e.g., What's for lunch today?")
      .fill('Team lunch near campus');

    const currentLocationButton = page.getByRole('button', {
      name: 'Use My Location',
    });
    await expect(currentLocationButton).toBeEnabled({ timeout: 15000 });
    await currentLocationButton.click();

    await expect(
      page.getByRole('heading', { name: 'Maple Noodles' }),
    ).toBeVisible();
    await page
      .locator('.place-result')
      .filter({ hasText: 'Maple Noodles' })
      .getByRole('button', { name: 'Add' })
      .click();

    await page
      .locator('.place-result')
      .filter({ hasText: 'Green Table' })
      .getByRole('button', { name: 'Add' })
      .click();

    const publishButton = page.getByRole('button', { name: '투표 게시하기' });
    await expect(publishButton).toBeEnabled();
    await publishButton.click();

    await expect(page.locator('h2', { hasText: 'Active Votes' })).toBeVisible({
      timeout: 15000,
    });
  });
});
