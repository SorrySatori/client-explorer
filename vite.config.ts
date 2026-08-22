/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'RAYNET_')

  return {
    plugins: [
      tanstackRouter({ target: 'react', autoCodeSplitting: true }),
      react(),
    ],
    server: {
      proxy: env.RAYNET_API_URL
        ? {
            '/api': {
              target: env.RAYNET_API_URL,
              changeOrigin: true,
              rewrite: (path) => path.replace(/^\/api/, ''),
              headers: { authorization: `Bearer ${env.RAYNET_BEARER_TOKEN}` },
            },
          }
        : undefined,
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/setupTests.ts'],
    },
  }
})
