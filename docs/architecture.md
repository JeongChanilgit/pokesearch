# Architecture

## Current state (v1)

Mobile-optimized web app. PWA installable. Single-user-at-a-time access, password-based ownership.

## Future state (v2+)

Native mobile app (iOS + Android) via React Native (Expo). Shares all business logic and API contracts with the web app. Only the UI layer is rewritten.

## Package responsibilities

```
apps/
├── web/               Next.js UI + API routes
└── mobile/            [future] Expo / React Native

packages/
├── calc/              Pure math: stats, bulk, damage, type chart.
│                      ZERO runtime dependencies. Works in any JS env.
├── types/             Shared TypeScript types + Zod schemas for API I/O.
│                      Same types used by server handlers and clients.
├── api-client/        Typed fetch wrappers. Input / output validated with
│                      schemas from packages/types. Used by apps/web client
│                      components AND apps/mobile later.
├── db/                Prisma client + schema + seed + password helpers.
│                      Server-side ONLY. Never imported by mobile or web client.
└── crawler/           Pokémon Showdown Champions ingester. Standalone CLI.
                       Fetches base + mod data from `smogon/pokemon-showdown`
                       (pinned SHA). Korean translations in `data/ko/*.json`.
```

## Critical dependency rules

**Directed acyclic graph**:

```
apps/web (UI)  ──→  api-client  ──→  types
apps/web (server routes)  ──→  db, calc, types
apps/mobile (future)  ──→  api-client  ──→  types
                      ──→  calc
crawler  ──→  db, types
```

- `calc` / `types`: zero deps on anything else. Pure.
- `api-client` / `db`: depend only on `types`.
- `apps/*`: consume packages. Never the other way around.

These rules enable the mobile app to pick up `api-client`, `calc`, and `types` as-is.

## Platform-specific vs. shared code

| Concern | Shared (`packages/`) | Web only (`apps/web/`) | Mobile only (`apps/mobile/`) |
|---|---|---|---|
| Formulas / calculations | ✅ `calc` | — | — |
| API request / response shapes | ✅ `types` | — | — |
| API calling code | ✅ `api-client` | — | — |
| DB access | ✅ `db` (server-side) | — | — |
| Routing | — | `app/` directory | `expo-router` |
| Styling | — | Tailwind classes | NativeWind or StyleSheet |
| Local storage | — | localStorage | AsyncStorage |
| Navigation | — | Next.js router | React Navigation |
| PWA / installation | — | manifest + SW | [native install] |

### Design tokens

Design tokens live in `docs/design.md` as raw hex values. Consumed by:
- `tailwind.config.ts` in web — maps hex to Tailwind theme colors.
- Future: a new `packages/design-tokens/` exports the same hex values as a plain JS object, consumed by both Tailwind (web) and StyleSheet (mobile).

For v1, keep tokens inline in `tailwind.config.ts`. Extract to a package only when mobile work starts — premature abstraction otherwise.

## API client design

`packages/api-client/` exports one function per endpoint. Each function:

1. Validates input with Zod schema from `packages/types`.
2. Calls `fetch()` — universal API available everywhere.
3. Validates response with Zod.
4. Returns typed result OR throws typed error.

Example:

```ts
// packages/api-client/src/search.ts
import { QuickSearchRequest, QuickSearchResponse } from '@pokesearch/types';

export async function quickSearch(
  input: QuickSearchRequest,
  opts?: { baseUrl?: string; fetch?: typeof fetch; locale?: string }
): Promise<QuickSearchResponse> {
  QuickSearchRequest.parse(input);
  const url = new URL('/api/search', opts?.baseUrl ?? '');
  url.searchParams.set('q', input.q);
  if (input.level) url.searchParams.set('level', String(input.level));

  const fetchFn = opts?.fetch ?? fetch;
  const res = await fetchFn(url.toString(), {
    headers: opts?.locale ? { 'Accept-Language': opts.locale } : {},
  });
  if (!res.ok) throw new ApiError(res.status, await res.text());

  return QuickSearchResponse.parse(await res.json());
}
```

`opts.baseUrl` and `opts.fetch` make it testable and mobile-compatible (React Native has its own fetch; Expo SecureStore etc. compose cleanly).

## Authentication model

There is no authentication. Password verification is per-action:

1. Client collects password in a modal.
2. Client calls `POST /api/teams/:id/verify` with password.
3. Server `bcrypt.compare` → responds with a short-lived signed token (JWT, 30 min).
4. Client includes token in `Authorization` header for the edit / delete request.
5. Server re-validates token on each request.

Token stored in sessionStorage (web) or SecureStore (mobile) — never localStorage.

This model ports directly to mobile: same endpoints, same tokens, same flow.

## Data fetching strategy

- **Server components** (web) fetch directly from DB via `packages/db` — faster, no extra round-trip.
- **Client components** (web and future mobile) fetch via `packages/api-client` + TanStack Query for caching / revalidation.

Why both? Web benefits from RSC (initial HTML is populated). Mobile has no RSC — always needs client-side fetch. Having `api-client` means mobile gets the same caching story.

## Offline behavior

- Web: Service Worker caches last-viewed teams and Pokémon data. Quick Search works offline for previously queried Pokémon.
- Mobile (future): TanStack Query's `persistQueryClient` to AsyncStorage gives similar behavior.

Write actions (create team, comment, like) always require online — no offline queue in v1.

## Crawler data pipeline

Data source: **Pokémon Showdown** (`smogon/pokemon-showdown`, MIT). The Champions mod at `data/mods/champions/` defines the legal roster and move/item overrides.

Pipeline order (single run):

1. **Natures** — `data/natures.ts` (base only; no mod override).
2. **Abilities** — base `data/abilities.ts` + mod `data/mods/champions/abilities.ts`; filtered to slugs referenced by Champions-legal Pokémon.
3. **Items** — base + mod; filter `isNonstandard === null` (Champions reinstates these items via the mod).
4. **Moves** — base `data/moves.ts` + mod overrides; filter `isNonstandard !== 'Past'`.
5. **Pokémon** — base `data/pokedex.ts`; filter slugs with `tier === 'OU'` in `data/mods/champions/formats-data.ts`. Form slots follow the `dex * 100 + slot` scheme with the default form always at slot 0.
6. **Learnsets** — `data/mods/champions/learnsets.ts` only; maps move slugs to numeric IDs via `data/id-manifest.json`.

**ID stability**: Showdown uses string slugs; we assign numeric IDs via `packages/crawler/data/id-manifest.json` (slug → id, sorted, 1-based). Pokémon IDs follow `dex * 100 + form_slot` (deterministic from the pokedex). The manifest is committed and grows monotonically — slugs never get new IDs after their first assignment.

**Korean translations**: maintained by hand in `packages/crawler/data/ko/*.json`. Run `pnpm crawl --allow-missing-ko` to generate `missing-slugs.txt`, then fill the JSON files and re-run without the flag.

## Migration discipline

- Every schema change = new Prisma migration file. Never edit existing ones.
- `pnpm db:migrate` on each slice that changes schema.
- Rollback plan: keep rollback SQL next to every migration.

## Monorepo tooling

- `pnpm workspaces` for package graph.
- Turborepo is NOT used in v1 — adds complexity for limited payoff at this size. Revisit when `apps/mobile` is added.

## Observability (later)

- Sentry for error tracking (web + mobile both supported).
- Server logs via console.log initially; structured logging (pino) when scale demands it.
