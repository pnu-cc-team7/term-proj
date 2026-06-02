import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 모든 복잡한 설정을 제거하고 가장 기본 상태로 유지
})
