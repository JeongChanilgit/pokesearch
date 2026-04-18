# PokeSearch

Bilingual (English / Korean) **Champions-exclusive** Pokémon team sharing platform. Mobile web first, architected for future native mobile app.

- No-login: every team and comment is secured by a bcrypt password
- Bilingual from day 1 — `/en` and `/ko` URL-prefixed locales
- PWA: installable, offline-ready for read paths
- Monorepo: `apps/web`, `packages/{calc,types,api-client,db,crawler}`
- Master data from Pokémon Showdown (MIT) Champions mod; sprites from PokeAPI CDN

See [CLAUDE.md](CLAUDE.md) and [`docs/`](docs/) for the authoritative project spec. This README is for getting the project running.

## Prerequisites

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- Docker (for local Postgres)

## Run locally (end-to-end)

```bash
# 1. Install deps (workspace-wide)
pnpm install

# 2. Copy env template to the repo root (Next.js loads it from here because pnpm dev runs from root)
cp .env.example .env

# 3. Start Postgres (Docker)
docker compose up -d db
# Confirm the container is running and the host port matches DATABASE_URL:
docker ps --filter name=pokesearch-postgres --format "table {{.Names}}\t{{.Ports}}"

# 4. Migrate and seed the DB
pnpm --filter @pokesearch/db db:migrate
pnpm --filter @pokesearch/db db:seed

# 5. Download sprites (Pokémon + items) into apps/web/public/sprites/
#    The app has no runtime external CDN dependency — sprites must exist locally.
pnpm --filter @pokesearch/crawler download-sprites
pnpm --filter @pokesearch/crawler download-item-sprites

# 6. Start the web app
pnpm --filter @pokesearch/web dev
# → http://localhost:3000 (redirects to /en or /ko)
```

### Common commands

```bash
pnpm test                       # run unit tests across the workspace
pnpm typecheck                  # tsc --noEmit across the workspace
pnpm --filter @pokesearch/web test:e2e     # Playwright smoke
pnpm --filter @pokesearch/crawler crawl                   # run the Showdown Champions crawler
pnpm --filter @pokesearch/crawler crawl --allow-missing-ko # dev mode: skip Korean validation
```

## Environment variables

| Var | Used by | Description |
|---|---|---|
| `DATABASE_URL` | `@pokesearch/db`, web API routes | Postgres connection string |
| `NEXT_PUBLIC_APP_URL` | `@pokesearch/web` | Canonical origin (used for metadata / sitemap) |
| `SHOWDOWN_PINNED_SHA` | `@pokesearch/crawler` | Git SHA of `smogon/pokemon-showdown` to fetch (default pinned in `src/showdown/fetch.ts`) |

`.env.example` in the repo root shows the complete list. Never commit real secrets.

## PWA

- Manifest: `apps/web/public/manifest.webmanifest`
- Service worker: compiled from `apps/web/app/sw.ts` by [serwist](https://serwist.pages.dev/) to `public/sw.js` at build time
- Icons in `apps/web/public/icons/` are generated placeholders (`node scripts/gen-placeholder-icons.mjs`). **Replace with designer art before launch.**
- Service worker is disabled in `NODE_ENV=development`; to test it locally, run `pnpm --filter @pokesearch/web build && pnpm --filter @pokesearch/web start`.

## Deployment

The web app is platform-agnostic (any Node host with Next.js 15 support). Recommended:

- **Vercel**: import the repo, set the build command to `pnpm --filter @pokesearch/web build`, output to `apps/web/.next`. Add env vars in the project settings.
- **Fly.io / Render / Railway**: supply a `Dockerfile` wrapping `pnpm install --frozen-lockfile && pnpm --filter @pokesearch/web build` and run `pnpm --filter @pokesearch/web start`. Ensure `DATABASE_URL` points at a managed Postgres (Neon / Supabase / RDS / etc.).
- Run the crawler on a weekly schedule (e.g. GitHub Actions workflow `crawl.yml`, or a managed cron).

## Launch checklist

- [ ] HTTPS configured in production (PWA install requires secure context)
- [ ] Error monitoring wired up (Sentry or equivalent)
- [ ] Privacy policy page (mention bcrypt password hashing and IP hashing for likes)
- [ ] Terms of use (no-login service caveats — lost passwords cannot be recovered)
- [ ] Real PWA icons generated from designer art (replace placeholders in `apps/web/public/icons/`)
- [ ] No real-person imagery audit
- [ ] PokeAPI CDN fallback plan if jsdelivr goes down (Cloudflare Images or self-host)
- [ ] Showdown (MIT) attribution visible (footer or About page)
- [ ] Korean translations complete (run `pnpm crawl --allow-missing-ko`, fill `data/ko/*.json`)
- [ ] Weekly crawler workflow (`crawl.yml`) enabled and green
- [ ] Lighthouse audit on `/en`, `/en/search`, `/en/teams/{id}` — PWA all green, Perf ≥ 90, A11y ≥ 95

## Work order (historical, for contributors)

Slices were built in order in dedicated Claude Code sessions. Prompts preserved under [`prompts/`](prompts/).

| # | Prompt | Deliverable |
|---|---|---|
| 1 | `slice-1-scaffold.md` | Monorepo + Next.js + i18n + Postgres + design tokens |
| 2 | `slice-2-calc.md` | `packages/calc` with full test coverage |
| 3 | `slice-3-types-and-api-client.md` | `packages/types` + `packages/api-client` |
| 4 | `slice-4-db-seed.md` | Prisma schema + bilingual sample seed |
| 5 | `slice-5-quick-search.md` | Quick Search (first working feature) |
| 6 | `slice-6-team-list-detail.md` | Team list + detail (read-only) |
| 7 | `slice-7-team-create.md` | Team creation with password |
| 8 | `slice-8-team-edit-delete.md` | Edit / delete flow (password verify) |
| 9 | `slice-9-comments-likes.md` | Comments + likes |
| 10 | `slice-10-crawler.md` | PokeAPI crawler (superseded by slice-12) |
| 11 | `slice-11-pwa.md` | PWA manifest, install flow, error boundaries, launch polish |
| 12 | `slice-12-showdown-migration.md` | Champions-only architecture; Showdown as sole data source |

## If requirements change mid-build

1. Update the relevant file in `docs/` first (the source of truth).
2. Then change the code to match.

`CLAUDE.md` and `docs/` always lead; code follows.
