import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// Kakao SDK 초기화
if (window.Kakao && !window.Kakao.isInitialized()) {
  const apiKey = import.meta.env.VITE_KAKAO_MAP_KEY;
  if (apiKey) {
    window.Kakao.init(apiKey);
  }
}

async function enableMocking() {
  const urlParams = new URLSearchParams(window.location.search);
  const skipMock = urlParams.get('no-mock') === 'true';

  // 개발 모드이면서 VITE_ENABLE_MOCKING이 'true'인 경우에만 활성화 (테스트 파라미터가 없을 때)
  if (import.meta.env.VITE_ENABLE_MOCKING !== 'true' || skipMock) {
    return
  }

  const { worker } = await import('./mocks/browser')

  // service worker가 준비될 때까지 대기
  return worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: './mockServiceWorker.js',
    }
  })
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
