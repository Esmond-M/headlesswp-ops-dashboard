import react from '@vitejs/plugin-react'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    test: {
      environment: 'jsdom',
      globals: true,
    },
    server: {
      proxy: {
        '/wp-json': {
          target: env.VITE_WP_ORIGIN || 'http://e-headless-wp.local',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
