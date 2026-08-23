/// <reference types="vitest/config" />
import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

// Dev stand-in for Vercel: mounts the real serverless handler
// (api/[...path].ts) on /api/* so dev and production execute the same code.
// Only the thin request/response adapter below is dev-specific.
function serverlessApi(env: Record<string, string>): Plugin {
  // The handler reads RAYNET_* from process.env (Vercel dashboard in prod),
  // so copy the .env values there; guard against stringifying undefined
  for (const key of ['RAYNET_API_URL', 'RAYNET_BEARER_TOKEN']) {
    if (env[key] && !process.env[key]) process.env[key] = env[key]
  }

  return {
    name: 'serverless-api',
    configureServer(server) {
      server.middlewares.use('/api', (req, res, next) => {
        run().catch(next)

        async function run() {
          // connect strips the '/api' mount prefix from req.url
          const url = new URL(req.url ?? '/', 'http://localhost')
          const query: Record<string, string | string[]> = {}
          for (const [key, value] of url.searchParams) {
            const prev = query[key]
            if (prev === undefined) query[key] = value
            else if (Array.isArray(prev)) prev.push(value)
            else query[key] = [prev, value]
          }
          // mirrors the vercel.json rewrite: /api/:path(.*) → ?path=:path
          query.path = url.pathname.slice(1)

          const vercelReq = Object.assign(req, { query })
          const vercelRes = Object.assign(res, {
            status(code: number) {
              res.statusCode = code
              return vercelRes
            },
            json(body: unknown) {
              res.setHeader('content-type', 'application/json; charset=utf-8')
              res.end(JSON.stringify(body))
              return vercelRes
            },
            send(body: string | Buffer) {
              res.end(body)
              return vercelRes
            },
          })

          const module = await server.ssrLoadModule('/api/[...path].ts')
          const handler = module.default as (
            req: typeof vercelReq,
            res: typeof vercelRes,
          ) => Promise<void>
          await handler(vercelReq, vercelRes)
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'RAYNET_')

  return {
    plugins: [
      tanstackRouter({ target: 'react', autoCodeSplitting: true }),
      react(),
      serverlessApi(env),
    ],
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/setupTests.ts'],
    },
  }
})
