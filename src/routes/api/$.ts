import { createFileRoute } from '@tanstack/react-router'

// Undefined methods would fall through to the HTML renderer, so reject
// them explicitly
const readOnly = () =>
  Response.json(
    { error: 'This proxy is read-only (GET only)' },
    { status: 405 },
  )

// Read-only proxy to the Raynet API: /api/<path> → ${RAYNET_API_URL}/<path>
// with the bearer token attached server-side. Raynet exposes writes on the
// same paths and the token must not be abusable through the proxy.
export const Route = createFileRoute('/api/$')({
  server: {
    handlers: {
      POST: readOnly,
      PUT: readOnly,
      PATCH: readOnly,
      DELETE: readOnly,
      GET: async ({ request }) => {
        const base = process.env.RAYNET_API_URL
        const token = process.env.RAYNET_BEARER_TOKEN
        if (!base || !token) {
          return Response.json(
            {
              error:
                'Missing RAYNET_API_URL / RAYNET_BEARER_TOKEN configuration',
            },
            { status: 500 },
          )
        }

        const url = new URL(request.url)
        // Preserve the exact path including trailing slashes (Raynet
        // collection endpoints require them) and the whole query string
        const path = url.pathname.replace(/^\/api\//, '')
        const baseUrl = new URL(base.endsWith('/') ? base : `${base}/`)
        const upstream = new URL(path, baseUrl)
        upstream.search = url.search

        if (
          upstream.origin !== baseUrl.origin ||
          !upstream.pathname.startsWith(baseUrl.pathname)
        ) {
          return Response.json({ error: 'Invalid path' }, { status: 400 })
        }

        const response = await fetch(upstream, {
          headers: { authorization: `Bearer ${token}` },
        })

        return new Response(response.body, {
          status: response.status,
          headers: {
            'content-type':
              response.headers.get('content-type') ??
              'application/octet-stream',
          },
        })
      },
    },
  },
})
