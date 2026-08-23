# Architecture — Client Explorer

Master–detail view of clients from a Raynet CRM instance. Records are
filterable/searchable through a single fulltext field. The scope is fixed
(hiring-task assignment) — the architecture is intentionally minimal,
no unnecessary layers.

Assignment requirements:

- Master-Detail view of Raynet clients, fulltext filtering/search
- UI styled to resemble Raynet CRM's own look & feel
- React + TypeScript
- Source code access + online demo (or README with run instructions)

Beyond the assignment, the app adds an advanced filter panel modeled after
Raynet's own — every "Kritéria klientů" criterion the company list API can
filter server-side: name, natural person, state, role, rating, owner,
economy activity, turnover, legal form, payment terms, city, e-mail,
reg. number, tax number, category, classifications 1–3 and tags. All filters
live in URL search params; codelist and user options load lazily and cache
for the session. Saved filters and smart filters are intentionally out of
scope (the list API cannot express them).

## Decisions

| Area         | Choice                          | Notes                                                                                                                                                                       |
| ------------ | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework    | TanStack Start (Vite, SPA mode) | Unifies dev and prod: the `/api` proxy is a server route running identically in both. SSR is off (`ssr: false` on the root route) — an authenticated data app needs no SEO. |
| Routing      | TanStack Router (file-based)    | Filters and full-text search live in the URL as search params (`validateSearch`), deep links work out of the box.                                                           |
| Server state | TanStack Query                  | `queryClient` is in the router context → loaders call `ensureQueryData`, components use `useSuspenseQuery`.                                                                 |
| Client state | `useState` (+ localStorage)     | The app is small, no need for Zustand/Context. Column visibility persists in localStorage — see "Where state lives".                                                        |
| Styling      | SCSS Modules (`*.module.scss`)  | Global tokens in `src/index.scss`.                                                                                                                                          |
| Testing      | Vitest + React Testing Library  | A few targeted tests, not blanket coverage. Setup in `src/setupTests.ts`.                                                                                                   |
| Deploy       | Vercel                          | Nitro build adapter — one deployment serves the SPA shell and the `/api` server route.                                                                                      |

## Where state lives

- **URL search params** — _what data am I looking at_: fulltext and all
  filter criteria (validated in `validateSearch`). Shareable and
  deep-linkable; a copied link reproduces the same result set.
- **localStorage** — _personal view preferences_: the visible table columns
  (`useVisibleColumns`). Deliberately not URL params (they would leak a
  personal layout into every shared link) and not plain React state (it
  would reset on every reload). Raynet stores its column setup server-side
  per user; this app has no backend of its own, so localStorage is the
  closest equivalent.
- **React state (`useState`)** — _ephemeral UI_: open panels and modals,
  draft filter rows, input drafts before commit.
- **TanStack Query cache** — all server data, keyed by query params.

## Data and API

- Data is owned by **Raynet CRM** (REST API v2, `https://app.raynet.cz/api/v2/`);
  the frontend never talks to it directly. Clients are the `company` entity.
- The server route ([`src/routes/api/$.ts`](src/routes/api/%24.ts)) is a
  **read-only** proxy `/api/<path>` → `${RAYNET_API_URL}/<path>`: it attaches
  `Authorization: Bearer ${RAYNET_BEARER_TOKEN}` server-side and rejects
  non-GET methods with 405 (Raynet exposes writes on the same paths — the
  token must not be abusable through the proxy). As a TanStack Start server
  route it runs natively in the dev server and in the production build —
  one implementation for both environments. The bearer token already carries
  the instance context, so no `X-Instance-*` headers are needed; it can be
  generated via `GET /security/bearertoken` (basic auth: username + API key +
  `X-Instance-Name`).
- Env vars: `RAYNET_API_URL`, `RAYNET_BEARER_TOKEN` (see [.env.example](.env.example),
  set in the Vercel dashboard for production). They are intentionally not
  `VITE_*` — they must never leak into the client bundle.
- **Filtering, search, and pagination are handled by the backend**:
  `fulltext`, field filters (`rating`, `state`, `role`, …; operators like
  `name[LIKE]=...`), `offset`/`limit` (max 1000), `sortColumn`/`sortDirection`.
  Responses use envelopes: list `{ success, totalCount, data }`, detail
  `{ success, data }`. Shape: route URL search params → query key → proxy
  query params → Raynet.
- **Rate limits**: 24 000 requests/day per instance and max 4 concurrent
  connections per client → QueryClient uses `staleTime: 60s` and `retry: 1`.
- FE layer: [src/api/http.ts](src/api/http.ts) (fetch wrapper + envelopes,
  `ApiError` with Raynet's `translatedMessage`) and
  [src/api/companies.ts](src/api/companies.ts) (types + `queryOptions`
  factories for the company list/detail).

## Development

```bash
nvm use            # Node 24 LTS (.nvmrc)
pnpm dev           # app + /api server route (needs .env, see .env.example)
pnpm test          # vitest
pnpm lint
pnpm build         # tsc -b && vite build
```

- The `/api` server route runs natively in `pnpm dev` — no proxy or emulation
  layer. The only dev-specific bit is [vite.config.ts](vite.config.ts) copying
  `RAYNET_*` from `.env` into `process.env` (production reads them from the
  Vercel dashboard).
- Unit tests run without the Start/Nitro plugins (see the `mode === 'test'`
  branch in [vite.config.ts](vite.config.ts)) — they need only jsdom.

- `src/routeTree.gen.ts` is generated by the TanStack Start plugin on Vite startup — do not edit; kept in git because `tsc -b` needs it.
- The ESLint rule `react-refresh/only-export-components` is disabled for `src/routes/**`
  (route files export `Route` alongside components; HMR is handled by the router plugin).

## Deployment

- Vercel, online demo: <https://client-explorer.vercel.app>. The `nitro`
  Vite plugin detects the Vercel environment at build time and emits the
  proper output (SPA shell + static assets + the `/api` server route as a
  function) — no `vercel.json` needed.
- SPA mode (`spa.enabled` in [vite.config.ts](vite.config.ts)) prerenders
  the app shell at build time; routes render entirely on the client
  (`ssr: false` on the root route), so loaders can fetch the relative
  `/api` proxy.
- The project previously deployed as a plain Vite SPA + a standalone Vercel
  serverless function; it was migrated to TanStack Start to unify the dev
  and prod server runtime (see git history for the routing workarounds this
  removed).

## Next steps

1. Final README polish before submission.
