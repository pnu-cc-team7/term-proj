import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',      // 에셋 참조를 상대 경로로 생성
  root: './',      // 현재 디렉토리(implementations/client)를 프로젝트 루트로 강제
  publicDir: 'public', // 정적 자산 디렉토리 명시
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
