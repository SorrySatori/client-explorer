// Temporary canary to diagnose function deployment on Vercel — remove
// once /api routing is confirmed working.
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({ ok: true, runtime: process.version })
}
