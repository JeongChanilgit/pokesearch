# Slice 5 — Quick Search (bilingual, end-to-end)

## Goal

First working user-facing feature. User searches for a Pokémon in English or Korean, sees bulk / speed / damage ranges. Full stack exercised: DB → API → api-client → page.

## Prompt to send to Claude Code

```
Read @CLAUDE.md, @docs/spec.md (screen 3), @docs/i18n.md, @docs/ui-components.md,
@docs/formulas.md.

VISUAL TARGET: Open @docs/mockups/reference.html in a browser. Screen 3 (Quick search) is the exact pixel target. Match it precisely — layout, colors, spacing, icons.

Implement Quick Search end-to-end with bilingual support.

## 1. API — GET /api/search

apps/web/app/api/search/route.ts

Query params:
- q: string (required) — accepts English or Korean input
- level: 50 | 100 (optional, default 50)

Lookup strategy (SQL):
```sql
SELECT * FROM pokemons
WHERE name_en ILIKE $1 || '%'
   OR name_ko ILIKE $1 || '%'
ORDER BY
  CASE
    WHEN name_en ILIKE $1 || '%' THEN 1
    WHEN name_ko ILIKE $1 || '%' THEN 1
    ELSE 2
  END,
  length(coalesce(name_en, name_ko)) ASC
LIMIT 1;
```

(Exact prefix match on either name wins; shortest match as tiebreaker.)

Response matches QuickSearchResponse from packages/types. Includes:
- pokemon: full info with weaknesses/resistances/immunities (computed from type-chart)
- bulk.physical/special: MIN/NORM/MAX at current level
- speed: MIN/NORM/MAX at current level
- moves: every learnable attacking move with damage MIN/NORM/MAX

All calculations use packages/calc. Never import calc inside a React component — do it in the route handler.

## 2. API — GET /api/search/suggest

apps/web/app/api/search/suggest/route.ts

Query params:
- q: string prefix, min 1 char, max 32

Returns top 10 matching Pokémon with id, nameEn, nameKo, spriteUrl.
Uses pg_trgm trigram similarity for ranking.

Format: `z.infer<typeof SuggestResponse>` from packages/types (add this schema in slice 3 if missing).

Response does NOT localize based on request — always returns both names. Client decides display.

## 3. Page — app/[locale]/search/page.tsx

Server component with a client island for the search input.

Layout (see reference.html screen 3):
- Header from layout (title + locale toggle)
- Search input (client component with debounced autocomplete) — open on focus shows recent searches
- Pokémon header row: sprite 32px + name with bilingual · muted · secondary + type badges
- Level selector on the right of header row (see ui-components.md §14)
- Weakness / Resist / Immune 3-line block (see ui-components.md §12). Show `×4` suffix for quadruple weaknesses. Hide Immune line if empty.
- MIN / NORM / MAX legend block (ui-components.md §11)
- Three MIN/NORM/MAX badge rows (ui-components.md §10) for Physical bulk, Special bulk, Speed
- Moves list (ui-components.md §9) — one card per attacking move, sorted by `damage.max` descending, category icon on the left
- Bottom nav (Quick Search active)

## 4. Components to build or reuse

Reuse from slice 1: `BottomNav`, `TypeBadge`, `PokemonHolder`, icon symbols.

Build here (match ui-components.md exactly):
- `components/SearchInput.tsx` — client, 200ms debounce, calls `api-client.suggestPokemon`
- `components/AutocompleteItem.tsx` — primary name + secondary language muted
- `components/MinNormMaxBadge.tsx` — one colored tile (min / norm / max variant)
- `components/MinNormMaxRow.tsx` — 3-tile row (ui-components.md §10)
- `components/MinNormMaxLegend.tsx` — definitions block (§11)
- `components/LevelToggle.tsx` — 50 | 100 pill (§14)
- `components/QuickSearchMoveCard.tsx` — full move card with icon + name + MIN/NORM/MAX (§9)

All user-visible strings come from next-intl messages. Add keys under `search.*` in both locales.

## 5. Name display helper

apps/web/lib/name.ts:
```ts
import type { Locale } from '@/i18n';
export function displayName(
  item: { nameEn: string; nameKo: string },
  locale: Locale,
): string {
  return locale === 'ko' ? item.nameKo : item.nameEn;
}
```

Used throughout for Pokémon / move / ability / nature names.

## 6. State and caching

- Server component reads `?q=` and `?level=` from searchParams, fetches via prisma directly, renders.
- Client component (SearchInput) calls api-client's `suggestPokemon` for autocomplete.
- On suggestion click, navigate to `/[locale]/search?q=...&level=...` — server re-renders with new result.
- Recent searches (last 5) in localStorage, keyed as 'recent_searches_v1'. Read in SearchInput's useEffect.

Do NOT use TanStack Query here — server components + URL state is simpler and enough for this page.

## 7. E2E test

apps/web/e2e/search.spec.ts (Playwright)
- Viewport 390×844
- Scenarios (parametrized per locale):
  - Visit `/en/search?q=Reuniclus` → sees "Reuniclus" title, Psychic type badge
  - Visit `/ko/search?q=리자몽` → sees "리자몽" title
  - Visit `/en/search?q=리자몽` → also works (searches both columns) and displays English name
  - Change level from 50 to 100 → stat values update

Run: `pnpm --filter @pokesearch/web e2e`

## 8. Acceptance

- Both locales render the same layout with different labels
- English input finds Korean-named entries and vice versa
- Recent searches persist in localStorage
- Network tab: one call for suggest, one for search result
- Screenshot matches `docs/mockups/03-quick-search.png` within reasonable tolerance
- Lighthouse: no console errors, no layout shifts

## Out of scope

- Team pages (next slices)
- Changing level on client without reload (v1 does a server roundtrip; that's fine on mobile)
```

## Checkpoint

After this slice the full stack has run once. Next slices are variations of this pattern.
