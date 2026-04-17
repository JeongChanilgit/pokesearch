# Slice 4 — DB schema + bilingual seed

## Goal

Prisma schema matching `docs/db-schema.md`. Initial migration applied. Seed data: 100 Pokémon with both `name_en` and `name_ko`, 200 moves, common abilities/items, all 25 natures. `pnpm db:seed` populates the DB.

## Prompt to send to Claude Code

```
Read @CLAUDE.md and @docs/db-schema.md.

Build out packages/db.

## 1. Prisma schema

packages/db/prisma/schema.prisma covers every table in @docs/db-schema.md:

- teams (with `level` field)
- team_pokemons
- team_pokemon_moves
- comments
- likes
- pokemons (with `name_en` AND `name_ko`)
- moves (with `name_en` AND `name_ko`)
- abilities (with `name_en`, `name_ko`, `description_en`, `description_ko`)
- items (with same bilingual cols + effect_mult jsonb)
- natures (with `name_en` and `name_ko`)
- pokemon_learnable_moves

Use:
- `@db.VarChar(N)` for fixed-width
- `@db.Timestamptz(6)` for timestamps
- `Json` for jsonb
- Arrays for String[] types
- Composite unique with @@unique

## 2. Migration SQL additions (raw)

CHECK constraints and trigram indexes require raw SQL in the migration file:

```sql
ALTER TABLE team_pokemons ADD CONSTRAINT ev_sum_max CHECK (
  ev_h + ev_a + ev_b + ev_c + ev_d + ev_s <= 510
);

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_pokemons_name_en_trgm ON pokemons USING gin (name_en gin_trgm_ops);
CREATE INDEX idx_pokemons_name_ko_trgm ON pokemons USING gin (name_ko gin_trgm_ops);
CREATE INDEX idx_moves_name_en_trgm ON moves USING gin (name_en gin_trgm_ops);
CREATE INDEX idx_moves_name_ko_trgm ON moves USING gin (name_ko gin_trgm_ops);
```

## 3. Helpers

packages/db/src/password.ts
  export async function hashPassword(plain: string): Promise<string>
  export async function verifyPassword(plain: string, hash: string): Promise<boolean>
  (bcrypt 10 rounds)

packages/db/src/client.ts
  Singleton PrismaClient with dev-mode hot-reload guard

packages/db/src/index.ts
  Re-exports { prisma, hashPassword, verifyPassword }

## 4. Seed data — bilingual sample

Seed files under packages/db/seed/data/ as TypeScript modules.

### natures.ts

All 25 Pokémon natures with name_en + name_ko + boost/reduce. Example:
```ts
{ id: 1, nameEn: 'Hardy', nameKo: '노력', boostStat: null, reduceStat: null },
{ id: 2, nameEn: 'Lonely', nameKo: '외로움', boostStat: 'atk', reduceStat: 'def' },
{ id: 3, nameEn: 'Adamant', nameKo: '고집', boostStat: 'atk', reduceStat: 'spa' },
// ... all 25
```

Verify that exactly 5 natures have null/null (Hardy, Docile, Serious, Bashful, Quirky).

### pokemons.ts — 100 entries

Use the PokeAPI official list for bilingual names. DO NOT type Korean names from memory — Korean Pokémon names are precise and typo-prone.

Approach:
1. Fetch programmatically during seed:
   - Species list: https://pokeapi.co/api/v2/pokemon-species/{id}
   - Response has a `names` array with entries like `{ language: { name: 'ko' }, name: '이상해씨' }`
2. For each of the first 100 dex entries, extract English and Korean names.
3. Base stats from https://pokeapi.co/api/v2/pokemon/{id}
4. Sprite URL: `https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/{id}.png`
5. ID scheme: `dex × 100 + 0` for base form.

For this slice, seed base forms only (no Mega / Alolan / etc.) — those come from the crawler in slice 10.

### moves.ts — top ~200 competitive moves

Fetch English + Korean names from PokeAPI similarly.
- https://pokeapi.co/api/v2/move/{name}
- Has names[] array with localized entries

Pick moves commonly used: Hyper Voice, Moonblast, Earthquake, Close Combat, Stealth Rock, Dragon Pulse, Thunderbolt, Ice Beam, etc. — a reasonable competitive set.

### abilities.ts — top ~80 abilities

Same approach. PokeAPI /ability/{name}.

### items.ts — top ~50 items

PokeAPI doesn't have perfect Korean localization for items. Use a curated list:
- Life Orb / 생명의 구슬
- Choice Band / 고집의 띠
- Choice Specs / 구애 안경
- Focus Sash / 기합의 띠
- Leftovers / 먹다남은음식
- ... etc

Add `effect_mult` jsonb for calculation-relevant ones:
```ts
{ id: 1, nameEn: 'Life Orb', nameKo: '생명의 구슬', effectMult: { allDamage: 1.3 } },
{ id: 2, nameEn: 'Choice Band', nameKo: '고집의 띠', effectMult: { physical: 1.5 } },
```

### pokemon-learnable-moves.ts

Minimal set per Pokémon — just enough to test the app. 10–15 moves each. This is placeholder data; the crawler will populate the full set later.

## 5. Seed script

packages/db/seed/index.ts
- prisma.$transaction to batch upsert
- Upsert by PK so re-running is safe
- Console output: "Seeded 100 pokemons, 200 moves, 80 abilities, 50 items, 25 natures"

packages/db/package.json:
```json
"scripts": {
  "db:seed": "tsx seed/index.ts"
}
```

## 6. Tests

packages/db/test/password.test.ts
- hashPassword then verifyPassword round-trip
- verifyPassword with wrong password returns false
- Hashes are different each time (bcrypt salt)

## Verification

- `pnpm --filter @pokesearch/db db:migrate` creates tables
- `pnpm --filter @pokesearch/db db:seed` populates DB
- `pnpm --filter @pokesearch/db db:studio` shows 100 Pokémon with BOTH name_en and name_ko filled
- At least one Mega-form-less entry for Pikachu (id=02500) and Charizard (id=00600) is visible
- All 25 natures present, exactly 5 are neutral
- CHECK constraint works: `INSERT` with EV sum > 510 is rejected

## Out of scope

- apps/web integration (next slice)
- Full crawler — only 100-Pokémon sample here
- Sample team data (add in slice 6 if needed)
```

## Important

- **Never type Korean names from memory.** Use PokeAPI programmatic fetch or a known-good bilingual dataset. Korean Pokémon names have official translations; approximations will be wrong.
- Seed script may take 30–60 seconds due to PokeAPI rate limits. That's expected.
