import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// Kakao SDK 초기화
if (window.Kakao && !window.Kakao.isInitialized()) {
  const apiKey = import.meta.env.VITE_KAKAO_MAP_KEY;
  if (apiKey) {
    window.Kakao.init(apiKey);
    console.log('--- Kakao SDK Initialized (Global) ---');
  }
}

async function enableMocking() {
  // 개발 모드이면서 VITE_ENABLE_MOCKING이 'true'인 경우에만 활성화
  if (import.meta.env.VITE_ENABLE_MOCKING !== 'true') {
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
