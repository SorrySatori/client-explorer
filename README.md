# Client Explorer

Master–detail client directory: list, detail, filtering, and full-text search.

See [ARCHITECTURE.md](ARCHITECTURE.md) for tech decisions, data flow, and next steps.

## Prerequisites

- Node 22+ (Node 24 LTS recommended; `nvm use` picks it up from [.nvmrc](.nvmrc))
- pnpm

## Getting started

```bash
pnpm install
pnpm dev           # frontend only (calls to /api will 404)
vercel dev         # frontend + serverless API proxy (needs .env, see .env.example)
```

## Scripts

| Script            | Description                                |
| ----------------- | ------------------------------------------ |
| `pnpm dev`        | Vite dev server                            |
| `pnpm build`      | Type-check (`tsc -b`) and production build |
| `pnpm test`       | Run tests once (Vitest)                    |
| `pnpm test:watch` | Run tests in watch mode                    |
| `pnpm lint`       | ESLint                                     |
| `pnpm format`     | Format everything with Prettier            |
| `pnpm preview`    | Preview the production build               |
