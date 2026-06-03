import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { createHtmlPlugin } from 'vite-plugin-html'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      react(),
      createHtmlPlugin({
        inject: {
          data: {
            VITE_KAKAO_MAP_KEY: env.VITE_KAKAO_MAP_KEY,
          },
        },
      }),
    ],
    base: './',
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      exclude: ['**/node_modules/**', '**/dist/**', '**/tests/**'],
    },
  }
})
