# Slice 1 — Project scaffold

## Goal

Empty pnpm monorepo with Next.js app, Postgres container, design tokens, and `next-intl` bilingual support configured. `pnpm dev` serves a minimal home page with working locale toggle.

## Prompt to send to Claude Code

```
Read @CLAUDE.md, @docs/design.md, @docs/ui-components.md, @docs/i18n.md, @docs/architecture.md.
Open @docs/mockups/reference.html in a browser — this is the visual target for every screen.

Set up the monorepo skeleton. Concretely:

## 1. Root setup

- package.json + pnpm-workspace.yaml (workspaces: apps/*, packages/*)
- .nvmrc (20)
- .gitignore (node_modules, .next, .env, *.db, .turbo)
- .env.example (DATABASE_URL, only)
- Root scripts: dev, build, lint, test, typecheck

## 2. docker-compose.yml

- postgres:16, DB `pokesearch`, user dev / pass dev
- Port 5432, named volume for persistence
- pg_trgm extension enabled (for name autocomplete later)

## 3. apps/web — Next.js 15 App Router

- TypeScript strict
- Tailwind CSS v4 configured with ALL tokens from @docs/ui-components.md (colors, typeBadges, everything)
- Pretendard Variable font self-hosted via @fontsource-variable/pretendard
- app/layout.tsx sets mobile viewport meta + viewport-fit=cover + apple-mobile-web-app-capable
- Build these shared components following @docs/ui-components.md EXACTLY:
  - components/IconDefs.tsx — SVG symbol definitions (i-list, i-plus, i-search, cat-phy, cat-spe, cat-sta). Mount once in root layout.
  - components/BottomNav.tsx — 3 tabs with SVG icons, respects safe-area-inset-bottom
  - components/LocaleToggle.tsx — top-right "EN · KO" pill
  - components/PokemonHolder.tsx — sprite + optional item overlay (PokeAPI jsdelivr URLs)
  - components/TypeBadge.tsx — all 18 types mapped to t-{type} classes

## 4. i18n setup with next-intl

- pnpm add next-intl in apps/web
- apps/web/i18n.ts — next-intl config, supported: ['en', 'ko'], default 'en'
- apps/web/middleware.ts — locale detection from Accept-Language, cookie override (NEXT_LOCALE)
- URL structure: /en/..., /ko/...
- apps/web/messages/en.json and ko.json with at least:
  - nav.{viewTeams, createTeam, quickSearch}
  - common.{save, cancel, delete, back}
  - home.{title, empty}
- apps/web/app/[locale]/layout.tsx wraps children in NextIntlClientProvider
- apps/web/app/[locale]/page.tsx renders a minimal home: app title + "Welcome" text from messages
- Add a locale toggle component at components/LocaleToggle.tsx (top-right, "EN | KO")

## 5. packages/calc — empty placeholder

- package.json + tsconfig.json (extends root)
- src/index.ts (empty export {})
- vitest installed + config
- Add path alias @pokesearch/calc in root tsconfig

## 6. packages/types — empty placeholder

- package.json + tsconfig.json
- src/index.ts (empty export {})
- Install zod as dep
- Add path alias @pokesearch/types

## 7. packages/api-client — empty placeholder

- package.json + tsconfig.json
- Depends on @pokesearch/types
- src/index.ts (empty export {})

## 8. packages/db — Prisma init

- Run prisma init
- prisma/schema.prisma: datasource and generator only. Models come in slice 4.
- DATABASE_URL from .env
- Scripts: db:generate, db:push, db:migrate, db:studio, db:seed
- src/index.ts re-exports prisma client (server-only)

## 9. packages/crawler — placeholder

- package.json with tsx and yargs installed but no code yet

## 10. Common dev tooling

- Shared ESLint + Prettier config at root
- tsconfig.base.json at root, extended by all packages
- Root README.md summarizing local dev setup

## 11. First commit

- git init
- "chore: initial scaffold" as first commit

## Rules

- Before adding any dependency not listed above, pause and ask.
- Everything should pass `pnpm typecheck` at the end.
- No UI components besides BottomNav and LocaleToggle for this slice.

## Verification

- `pnpm install` clean
- `docker compose up -d` brings up Postgres
- `pnpm --filter @pokesearch/web dev` → visit http://localhost:3000 → redirects to /en → page shows app title + welcome + bottom nav + locale toggle
- Click KO in locale toggle → URL becomes /ko, labels in Korean, nav labels in Korean
- Reload → locale persists via cookie
- `pnpm --filter @pokesearch/db db:push` succeeds on empty schema

## Out of scope

- Prisma models (slice 4)
- Calculation logic (slice 2)
- API contracts (slice 3)
- Any feature page beyond the home stub
```

## Checkpoint

After this slice, you can run the app and switch languages. Nothing else works yet — that's expected.
