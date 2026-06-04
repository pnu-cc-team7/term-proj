import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// Kakao SDK 초기화
if (window.Kakao?.isInitialized && window.Kakao.init && !window.Kakao.isInitialized()) {
  const apiKey = import.meta.env.VITE_KAKAO_MAP_KEY;
  if (apiKey) {
    window.Kakao.init(apiKey);
  }
}

// MSW 비활성화 (진짜 백엔드와 통신하기 위함)
/*
async function enableMocking() {
  const urlParams = new URLSearchParams(window.location.search);
  const skipMock = urlParams.get('no-mock') === 'true';

  if (import.meta.env.VITE_ENABLE_MOCKING !== 'true' || skipMock) {
    return
  }

  const { worker } = await import('./mocks/browser')
  return worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: './mockServiceWorker.js',
    }
  })
}
*/

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
