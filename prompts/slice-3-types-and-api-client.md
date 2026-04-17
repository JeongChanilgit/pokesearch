# Slice 3 — Shared types + API client

## Goal

Establish `packages/types` (Zod schemas + TS types for every API endpoint) and `packages/api-client` (typed fetchers). Both are consumed by the web app now and by the future mobile app without changes.

## Prompt to send to Claude Code

```
Read @CLAUDE.md, @docs/architecture.md, @docs/spec.md.

Build packages/types and packages/api-client. No implementations yet — just contracts. They'll be consumed starting in slice 5.

## 1. packages/types/src/

Each file exports Zod schemas AND inferred TS types for one domain.

Structure:
├── common.ts       Locale, UUID, basic helpers
├── pokemon.ts      Pokemon master data shapes (public-facing, bilingual)
├── move.ts
├── ability.ts
├── item.ts
├── nature.ts
├── team.ts         Team + TeamPokemon + TeamPokemonMove shapes
├── comment.ts
├── search.ts       Quick search I/O
├── errors.ts       Standard ApiError shape
└── index.ts        Barrel export

## 2. Key schemas (bilingual display)

```ts
// pokemon.ts
export const PokemonSummary = z.object({
  id: z.number().int().positive(),
  nameEn: z.string(),
  nameKo: z.string(),
  types: z.array(TypeName).min(1).max(2),
  spriteUrl: z.string().url(),
});
export type PokemonSummary = z.infer<typeof PokemonSummary>;

export const PokemonFull = PokemonSummary.extend({
  baseH: z.number().int(), baseA: z.number().int(), baseB: z.number().int(),
  baseC: z.number().int(), baseD: z.number().int(), baseS: z.number().int(),
  formOf: z.number().int().nullable(),
});
```

Notice we include BOTH `nameEn` and `nameKo` in API responses — the UI picks based on locale. Do NOT pick on the server; keep responses locale-agnostic so they cache better and the same response serves both locales.

## 3. Quick search schemas

```ts
// search.ts
export const QuickSearchRequest = z.object({
  q: z.string().min(1).max(32),
  level: z.union([z.literal(50), z.literal(100)]).optional().default(50),
});

export const StatRange = z.object({
  min: z.number().int().nonnegative(),
  norm: z.number().int().nonnegative(),
  max: z.number().int().nonnegative(),
});

export const QuickSearchMove = z.object({
  id: z.number().int(),
  nameEn: z.string(),
  nameKo: z.string(),
  type: TypeName,
  category: z.enum(['physical', 'special']),
  power: z.number().int().positive(),
  damage: StatRange,
});

export const QuickSearchResponse = z.object({
  pokemon: PokemonFull.extend({
    weaknesses: z.array(TypeName),
    resistances: z.array(TypeName),
    immunities: z.array(TypeName),
  }).nullable(),
  bulk: z.object({
    physical: StatRange,
    special: StatRange,
  }).optional(),
  speed: StatRange.optional(),
  moves: z.array(QuickSearchMove),
});
```

## 4. Team schemas

```ts
// team.ts
export const TeamPokemonMoveInput = z.object({
  moveId: z.number().int(),
  slotOrder: z.number().int().min(1).max(4),
});

export const TeamPokemonInput = z.object({
  slotOrder: z.number().int().min(1).max(6),
  pokemonId: z.number().int(),
  abilityId: z.number().int(),
  itemId: z.number().int().nullable(),
  natureId: z.number().int().min(1).max(25),
  evs: z.object({
    h: z.number().int().min(0).max(252),
    a: z.number().int().min(0).max(252),
    b: z.number().int().min(0).max(252),
    c: z.number().int().min(0).max(252),
    d: z.number().int().min(0).max(252),
    s: z.number().int().min(0).max(252),
  }).refine((e) => e.h+e.a+e.b+e.c+e.d+e.s <= 510, { message: 'EV total exceeds 510' }),
  ivs: z.object({
    h: z.number().int().min(0).max(31),
    a: z.number().int().min(0).max(31),
    b: z.number().int().min(0).max(31),
    c: z.number().int().min(0).max(31),
    d: z.number().int().min(0).max(31),
    s: z.number().int().min(0).max(31),
  }).default({ h: 31, a: 31, b: 31, c: 31, d: 31, s: 31 }),
  teraType: TypeName.nullable().default(null),
  moves: z.array(TeamPokemonMoveInput).max(4),
});

export const CreateTeamRequest = z.object({
  name: z.string().min(1).max(60),
  description: z.string().max(500).optional(),
  level: z.union([z.literal(50), z.literal(100)]),
  password: z.string().min(4).max(64),
  pokemons: z.array(TeamPokemonInput).min(1).max(6),
});

export const CreateTeamResponse = z.object({
  id: z.string().uuid(),
});

// ... additional schemas for list, detail, update
```

## 5. packages/api-client/src/

One file per endpoint group. All functions:
1. Validate input with Zod (throws ZodError on invalid)
2. Call fetch()
3. Validate response with Zod
4. Return typed result OR throw ApiError

Structure:
├── client.ts         Configurable base client (baseUrl, fetch, locale)
├── errors.ts         ApiError class
├── search.ts         quickSearch(), suggestPokemon()
├── teams.ts          listTeams(), getTeam(), createTeam(), updateTeam(), deleteTeam(), verifyTeamPassword()
├── comments.ts       listComments(), createComment(), deleteComment()
├── likes.ts          addLike(), removeLike(), getLikeStatus()
├── pokemons.ts       listPokemons(), getPokemonMoves()
└── index.ts

## 6. Client factory

```ts
// client.ts
export interface ApiClientOptions {
  baseUrl?: string;        // default '' (same-origin)
  fetchFn?: typeof fetch;  // default globalThis.fetch
  locale?: 'en' | 'ko';    // forwarded as Accept-Language header
}

export function createApiClient(opts: ApiClientOptions = {}) {
  return {
    quickSearch: (input) => quickSearch(input, opts),
    listTeams: (input) => listTeams(input, opts),
    // ...
  };
}
```

This factory makes it trivial to use in React Native:
```ts
const api = createApiClient({
  baseUrl: 'https://pokesearch.com',
  fetchFn: fetch,
  locale: 'en',
});
```

## 7. Tests

packages/api-client/test/
├── client.test.ts       Factory uses provided fetchFn + baseUrl
└── search.test.ts       Mocked fetch, validates inputs and outputs

Use Vitest with fetch mocked via vi.stubGlobal.

Example:
```ts
import { vi, test, expect } from 'vitest';
import { quickSearch } from '../src/search';

test('quickSearch forwards locale header', async () => {
  const mockFetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ pokemon: null, moves: [] }),
  });
  await quickSearch({ q: 'Reuniclus' }, { fetchFn: mockFetch, locale: 'en' });
  expect(mockFetch).toHaveBeenCalledWith(
    expect.stringContaining('/api/search?q=Reuniclus'),
    expect.objectContaining({
      headers: expect.objectContaining({ 'Accept-Language': 'en' })
    })
  );
});
```

## Verification

- `pnpm --filter @pokesearch/types typecheck` clean
- `pnpm --filter @pokesearch/api-client test` all pass
- Importing any schema from types gives both Zod validator and TS type
- api-client can be imported and called with a custom fetchFn

## Out of scope

- API route implementations (next slices)
- DB schema (slice 4)
- UI (slice 5+)
```

## Why this matters

Most starter projects skip this slice and let contracts leak across folders. Doing it upfront means:
- Every API response shape has one definition, one source of truth.
- The mobile app plugs in later with zero server-side changes.
- Type errors catch bugs at compile time instead of runtime.
