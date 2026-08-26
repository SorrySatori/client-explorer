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
pnpm dev               # TanStack Start dev server (app + /api proxy route)
```

The app is instance-agnostic: **any Raynet instance's bearer token works**,
only the data differs. See [ARCHITECTURE.md](ARCHITECTURE.md) → Data and API
for how to generate a token for your instance.

## Scripts

| Script              | Description                                |
| ------------------- | ------------------------------------------ |
| `pnpm dev`          | Vite dev server (incl. the `/api` handler) |
| `pnpm build`        | Type-check (`tsc -b`) and production build |
| `pnpm test`         | Run tests once (Vitest)                    |
| `pnpm test:watch`   | Run tests in watch mode                    |
| `pnpm lint`         | ESLint                                     |
| `pnpm format`       | Format everything with Prettier            |
| `pnpm format:check` | Check formatting without writing           |
| `pnpm preview`      | Preview the production build               |
