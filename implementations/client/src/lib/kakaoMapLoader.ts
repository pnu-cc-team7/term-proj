const KAKAO_MAP_SCRIPT_ID = 'kakao-maps-sdk';
const KAKAO_MAP_LIBRARIES = 'services,clusterer';

export interface KakaoLatLng {
  getLat?: () => number;
  getLng?: () => number;
}

export interface KakaoLatLngBounds {
  extend: (position: KakaoLatLng) => void;
}

export interface KakaoMapInstance {
  setCenter: (position: KakaoLatLng) => void;
  setBounds: (bounds: KakaoLatLngBounds) => void;
  setLevel: (level: number) => void;
  relayout: () => void;
}

export interface KakaoMarkerImage {
  readonly src?: string;
}

export interface KakaoMarkerInstance {
  setMap: (map: KakaoMapInstance | null) => void;
  setImage?: (image: KakaoMarkerImage) => void;
}

export interface KakaoInfoWindowInstance {
  open: (map: KakaoMapInstance, marker: KakaoMarkerInstance) => void;
  close: () => void;
}

export interface KakaoPlaceSearchResult {
  id: string;
  place_name: string;
  address_name: string;
  road_address_name?: string;
  category_name?: string;
  distance?: string;
  phone?: string;
  place_url?: string;
  x: string;
  y: string;
}

export interface KakaoPlaceSearchOptions {
  location?: KakaoLatLng;
  radius?: number;
  page?: number;
  size?: number;
}

export interface KakaoPlaceSearchPagination {
  totalCount?: number;
  current?: number;
  last?: number;
  hasNextPage?: boolean;
  nextPage?: () => void;
  gotoPage?: (page: number) => void;
}

export interface KakaoPlacesService {
  keywordSearch: (
    keyword: string,
    callback: (
      data: KakaoPlaceSearchResult[],
      status: string,
      pagination?: KakaoPlaceSearchPagination,
    ) => void,
    options?: KakaoPlaceSearchOptions,
  ) => void;
}

export interface KakaoMapsServices {
  Places: new () => KakaoPlacesService;
  Status: {
    OK: string;
    ZERO_RESULT?: string;
    ERROR?: string;
  };
}

export interface KakaoMaps {
  load: (callback: () => void) => void;
  LatLng: new (lat: number, lng: number) => KakaoLatLng;
  LatLngBounds: new () => KakaoLatLngBounds;
  Map: new (
    container: HTMLElement,
    options: { center: KakaoLatLng; level: number },
  ) => KakaoMapInstance;
  Marker: new (options: {
    position: KakaoLatLng;
    image?: KakaoMarkerImage;
  }) => KakaoMarkerInstance;
  MarkerImage: new (
    src: string,
    size: object,
    options?: { offset?: object },
  ) => KakaoMarkerImage;
  Size: new (width: number, height: number) => object;
  Point: new (x: number, y: number) => object;
  InfoWindow: new (options: { content: string }) => KakaoInfoWindowInstance;
  event: {
    addListener: (
      target: KakaoMarkerInstance,
      eventName: string,
      handler: () => void,
    ) => void;
  };
  services: KakaoMapsServices;
}

interface KakaoMapsNamespace {
  maps?: KakaoMaps;
}

interface KakaoAuthSdk {
  isInitialized?: () => boolean;
  init?: (apiKey: string) => void;
  Auth?: {
    authorize: (options: { redirectUri: string }) => void;
  };
}

declare global {
  interface Window {
    kakao?: KakaoMapsNamespace;
    Kakao?: KakaoAuthSdk;
  }
}

export type KakaoMapLoaderErrorCode =
  | 'missing-key'
  | 'script-load-failed'
  | 'sdk-unavailable'
  | 'maps-load-failed';

export interface KakaoMapLoaderError {
  code: KakaoMapLoaderErrorCode;
  message: string;
}

export type KakaoMapLoadResult =
  | { ok: true; maps: KakaoMaps }
  | { ok: false; error: KakaoMapLoaderError };

let loadPromise: Promise<KakaoMapLoadResult> | null = null;

const errorResult = (
  code: KakaoMapLoaderErrorCode,
  message: string,
): KakaoMapLoadResult => ({
  ok: false,
  error: { code, message },
});

const getKakaoMapKey = () =>
  String(import.meta.env.VITE_KAKAO_MAP_KEY || '').trim();

const waitForKakaoMaps = (): Promise<KakaoMapLoadResult> =>
  new Promise((resolve) => {
    const maps = window.kakao?.maps;

    if (!maps) {
      resolve(
        errorResult(
          'sdk-unavailable',
          'Kakao Maps SDK is not available on window.kakao.',
        ),
      );
      return;
    }

    try {
      maps.load(() => {
        if (!window.kakao?.maps?.services?.Places) {
          resolve(
            errorResult(
              'maps-load-failed',
              'Kakao Places service is unavailable after SDK initialization.',
            ),
          );
          return;
        }

        resolve({ ok: true, maps: window.kakao.maps });
      });
    } catch {
      resolve(
        errorResult(
          'maps-load-failed',
          'Kakao Maps SDK failed while initializing.',
        ),
      );
    }
  });

const appendKakaoMapScript = (apiKey: string): Promise<KakaoMapLoadResult> =>
  new Promise((resolve) => {
    const existingScript = document.getElementById(
      KAKAO_MAP_SCRIPT_ID,
    ) as HTMLScriptElement | null;

    if (existingScript) {
      if (window.kakao?.maps) {
        waitForKakaoMaps().then(resolve);
        return;
      }

      existingScript.addEventListener('load', () => {
        waitForKakaoMaps().then(resolve);
      });
      existingScript.addEventListener('error', () => {
        resolve(
          errorResult(
            'script-load-failed',
            'Kakao Maps SDK script failed to load.',
          ),
        );
      });
      return;
    }

    const script = document.createElement('script');
    script.id = KAKAO_MAP_SCRIPT_ID;
    script.type = 'text/javascript';
    script.src =
      `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(
        apiKey,
      )}&libraries=${KAKAO_MAP_LIBRARIES}&autoload=false`;
    script.async = true;

    script.addEventListener('load', () => {
      waitForKakaoMaps().then(resolve);
    });
    script.addEventListener('error', () => {
      resolve(
        errorResult(
          'script-load-failed',
          'Kakao Maps SDK script failed to load. Check the API key, allowed domains, or network.',
        ),
      );
    });

    document.head.appendChild(script);
  });

export const loadKakaoMapsSdk = (): Promise<KakaoMapLoadResult> => {
  const apiKey = getKakaoMapKey();

  if (!apiKey) {
    return Promise.resolve(
      errorResult(
        'missing-key',
        'VITE_KAKAO_MAP_KEY is not configured. Add it to implementations/client/.env.',
      ),
    );
  }

  if (!loadPromise) {
    loadPromise = appendKakaoMapScript(apiKey);
  }

  return loadPromise;
};
