/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { nitro } from 'nitro/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // The /api server route reads RAYNET_* from process.env (set in the Vercel
  // dashboard in production); copy the .env values there for dev
  const env = loadEnv(mode, process.cwd(), 'RAYNET_')
  for (const key of ['RAYNET_API_URL', 'RAYNET_BEARER_TOKEN']) {
    if (env[key] && !process.env[key]) process.env[key] = env[key]
  }

  return {
    plugins:
      // Unit tests run in jsdom without the Start server runtime
      mode === 'test'
        ? [react()]
        : [tanstackStart({ spa: { enabled: true } }), nitro(), react()],
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/setupTests.ts'],
    },
  }
})
