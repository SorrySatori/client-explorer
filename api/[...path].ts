import type { VercelRequest, VercelResponse } from '@vercel/node'

// Vercel's function type-check resolves the global fetch Response to a
// different type than local @types/node, so pin the small surface we use
interface UpstreamResponse {
  status: number
  headers: { get(name: string): string | null }
  arrayBuffer(): Promise<ArrayBuffer>
}

const RAYNET_API_URL = process.env.RAYNET_API_URL
const RAYNET_BEARER_TOKEN = process.env.RAYNET_BEARER_TOKEN

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!RAYNET_API_URL || !RAYNET_BEARER_TOKEN) {
    res.status(500).json({
      error: 'Missing RAYNET_API_URL / RAYNET_BEARER_TOKEN configuration',
    })
    return
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'This proxy is read-only (GET only)' })
    return
  }

  const segments = req.query.path
  const path = Array.isArray(segments) ? segments.join('/') : (segments ?? '')
  const url = new URL(
    path,
    RAYNET_API_URL.endsWith('/') ? RAYNET_API_URL : `${RAYNET_API_URL}/`,
  )

  for (const [key, value] of Object.entries(req.query)) {
    if (key === 'path' || value === undefined) continue
    for (const v of Array.isArray(value) ? value : [value]) {
      url.searchParams.append(key, v)
    }
  }

  const upstream = (await fetch(url, {
    headers: { authorization: `Bearer ${RAYNET_BEARER_TOKEN}` },
  })) as unknown as UpstreamResponse

  res.status(upstream.status)
  const contentType = upstream.headers.get('content-type')
  if (contentType) res.setHeader('content-type', contentType)
  res.send(Buffer.from(await upstream.arrayBuffer()))
}
