# Client Explorer

Master–detail client directory: list, detail, filtering, and full-text search.

**Online demo:** <https://client-explorer.vercel.app>

See [ARCHITECTURE.md](ARCHITECTURE.md) for tech decisions, data flow, and next steps.

## Prerequisites

- Node 22+ (Node 24 LTS recommended; `nvm use` picks it up from [.nvmrc](.nvmrc))
- pnpm

## Getting started

```bash
pnpm install
cp .env.example .env   # fill in RAYNET_API_URL + RAYNET_BEARER_TOKEN
pnpm dev               # Vite dev server; /api/* runs the same serverless handler as prod
```

## Scripts

| Script            | Description                                |
| ----------------- | ------------------------------------------ |
| `pnpm dev`        | Vite dev server (incl. the `/api` handler) |
| `pnpm build`      | Type-check (`tsc -b`) and production build |
| `pnpm test`       | Run tests once (Vitest)                    |
| `pnpm test:watch` | Run tests in watch mode                    |
| `pnpm lint`       | ESLint                                     |
| `pnpm format`     | Format everything with Prettier            |
| `pnpm preview`    | Preview the production build               |
