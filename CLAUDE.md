# PokeSearch

## One-line summary

No-login Pokémon team sharing & builder platform. Bilingual (Korean / English). Mobile web first, architected for future native mobile app. **Champions-exclusive** — only Pokémon legal in the Champions metagame. Master data from Pokémon Showdown (MIT-licensed `smogon/pokemon-showdown`, `data/mods/champions/` mod). Sprites from PokeAPI CDN (permissive).

## Core features

1. **View Teams** — Browse shared teams (sort / filter) + team detail (6 Pokémon, stats, moves, comments, likes)
2. **Create Team** — Pick Pokémon, configure ability / item / nature / EVs / moves with live-calculated damage output per move
3. **Quick Search** — Enter a Pokémon name in either language, see bulk / speed / move damage as MIN / NORM / MAX ranges

Champions-exclusive metagame site. The team creator chooses the level (default 50) and the platform enforces Champions roster legality.

## Non-negotiable rules

- **No login system.** Every team and every comment is owned by a bcrypt-hashed password (10 rounds) set at creation time.
- **Bilingual (ko / en) from day 1.** All UI strings via i18n. All Pokémon / move / ability / item / nature names stored as both `name_ko` and `name_en` in DB. User-generated content (team names, descriptions, comments) is NOT translated — stored as-is.
- **Mobile first.** Design for 360px viewport. All tap targets ≥44×44px. Bottom tab nav.
- **Calculation formulas live only in `packages/calc`.** Never copy-paste formulas elsewhere.
- **Never fill in Pokémon data from memory.** Species names, base stats, move power — always query DB.
- **Never modify master data tables from the app.** Only `teams`, `team_pokemons`, `team_pokemon_moves`, `comments`, `likes` are written by users.

## Stack (locked in)

- Next.js 15 (App Router) + TypeScript + React Server Components
- `next-intl` for i18n (URL-prefixed locales: `/en/...`, `/ko/...`)
- Prisma + PostgreSQL
- Tailwind CSS v4 (with design tokens from `docs/design.md`)
- bcrypt (password hashing)
- Zod (runtime validation — shared between client and server)
- TanStack Query (data fetching — works in both web and React Native)
- Vitest (unit tests) + Playwright (E2E, 390×844 viewport)
- pnpm workspaces (monorepo)

## File map

```
apps/web/           Next.js app (API routes + pages)
packages/calc/      Pure functions: stats, bulk, damage, type chart.
                    Zero runtime deps. Reusable by future mobile app.
packages/types/     Shared TypeScript types + Zod schemas.
                    API contracts live here.
packages/api-client/  Typed fetch wrappers around /api routes.
                      Consumed by apps/web AND future apps/mobile.
packages/db/        Prisma schema + migrations + seed + password helpers.
packages/crawler/   Showdown Champions crawler (standalone CLI). Fetches from
                    `smogon/pokemon-showdown` at a pinned SHA. Korean
                    translations in `packages/crawler/data/ko/*.json`.
docs/               Single source of truth. Read these first.
  mockups/reference.html    The target UI. Open in browser to see how
                            every screen must render. Pixel-level reference.
  ui-components.md          Component patterns, HTML/CSS templates,
                            SVG icon definitions, design tokens.
                            MATCH EXACTLY when implementing screens.
prompts/            Per-slice work prompts for Claude Code.
```

## UI implementation rule

Every screen you build MUST match `docs/mockups/reference.html` visually. If the rendered page doesn't look the same, the implementation is wrong — fix the code, don't change the reference. Use `docs/ui-components.md` for exact HTML/CSS/SVG patterns.

## Future mobile app expansion

When `apps/mobile` is added later (Expo + React Native):
- Reuses `packages/calc`, `packages/types`, `packages/api-client` as-is.
- Replaces only the UI layer. Tailwind classes don't port — will use NativeWind or StyleSheet.
- Design tokens in `docs/design.md` are listed as raw hex values so they can be consumed by both Tailwind and React Native.
- API client must use `fetch` (universal) not `next/server` specifics.

**Implication for current work**: keep business logic out of React components. Components just render; hooks + api-client + calc do the thinking.

## Core formulas (summary — full version in `docs/formulas.md`)

All formulas take `level` as parameter. Default 50 for VGC-style, 100 for most other formats.

- **HP stat**: `⌊(2·B + IV + ⌊EV/4⌋) × level/100⌋ + level + 10`
- **Other stats**: `⌊(⌊(2·B + IV + ⌊EV/4⌋) × level/100⌋ + 5) × nature⌋`
- **Physical bulk**: `HP × Def ÷ 0.411`
- **Special bulk**: `HP × SpD ÷ 0.411`
- **Damage output**: `Attack × MovePower × STAB(1.5) × ability × item`
- **MIN / NORM / MAX**: `{reducing nature, 0 EV}` / `{neutral nature, 0 EV}` / `{boosting nature, 252 EV}`

## i18n conventions (summary — full version in `docs/i18n.md`)

- Default locale: `en` (primary audience is international).
- Supported: `en`, `ko`.
- URL structure: `/en/teams/123`, `/ko/teams/123`.
- Locale detection on first visit: `Accept-Language` header, fallback to `en`.
- Locale toggle persists in cookie `NEXT_LOCALE`.
- Message files: `apps/web/messages/{en,ko}.json`.
- Pokémon / move names come from DB columns `name_en` / `name_ko`, not from translation files.

## Design tokens (summary — full version in `docs/design.md`)

- Primary action: black background + white text.
- Physical = coral (`#FAECE7 / #993C1D`)
- Special = purple (`#EEEDFE / #534AB7`)
- Speed = teal (`#E1F5EE / #0F6E56`)
- MIN = red, NORM = blue, MAX = green

## Testing policy

- `packages/calc`: **every formula has at least 3 unit-test cases covering min / mid / max**. Must pass before commit.
- `packages/api-client`: mocked API tests for happy path + error path per endpoint.
- UI: Playwright smoke test at 390×844 per major screen (one test per slice).
- Calculation outputs rounded with `Math.floor()` at the final step. No floating-point leakage.

## Good working patterns

- One slice end-to-end at a time. No layer-by-layer progression.
- New Claude Code session per slice — keeps context clean.
- Attach mockup images from `docs/mockups/` when implementing UI.
- Run `pnpm test && pnpm typecheck` before ending each slice.

## Things NOT to do

- Do not use real-person images anywhere.
- Do not store passwords in localStorage / sessionStorage / cookies (server-only, bcrypt hash).
- Do not hardcode any user-facing string in a component — use i18n messages.
- Do not host Pokémon official art directly — PokeAPI CDN only.
- Do not add dependencies without asking first.
- Do not edit migration files after they've been applied — create a new migration instead.
- Do not couple UI components to fetch logic — always go through `packages/api-client`.
- Do not deviate from `docs/mockups/reference.html`. Match pixel-for-pixel.
- Do not invent new component patterns when one exists in `docs/ui-components.md`.
