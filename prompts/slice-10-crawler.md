# Slice 10 — Bulbapedia + PokeAPI crawler

## Goal

Replace the 100-Pokémon sample seed with the full dataset. Crawler is a standalone CLI; runs on demand now, on a schedule later.

## Prompt to send to Claude Code

```
Read @CLAUDE.md and @docs/db-schema.md.

Build packages/crawler.

## Data sources

Primary: **PokeAPI** (https://pokeapi.co/api/v2/) — has structured bilingual names including Korean, plus base stats, types, learnable moves.

Secondary: **Bulbapedia** — only needed for data PokeAPI lacks (specific competitive metadata). For v1, rely on PokeAPI alone. Skip Bulbapedia until a concrete gap appears.

## Directory

packages/crawler/src/
├── index.ts              CLI entry with yargs
├── pokeapi.ts            Typed client for pokeapi.co
├── parsers/
│   ├── pokemon.ts        species + varieties → pokemon rows (base + alt forms)
│   ├── move.ts
│   ├── ability.ts
│   ├── item.ts
│   └── learnset.ts       pokemon.learnable_moves
├── writer.ts             Batched Prisma upserts
├── state.ts              .crawler-state.json for resume
└── run.ts                Orchestration

## CLI

```bash
pnpm --filter @pokesearch/crawler crawl --all        # everything
pnpm --filter @pokesearch/crawler crawl --pokemon    # just pokemons table
pnpm --filter @pokesearch/crawler crawl --moves
pnpm --filter @pokesearch/crawler crawl --learnsets
pnpm --filter @pokesearch/crawler crawl --resume     # continue from last state
```

## PokeAPI notes

- No auth required, but self-impose 10 req/s limit
- Each species endpoint has `names[]` array with entries like { language: { name: 'en' }, name: 'Charizard' } — extract 'en' and 'ko'
- Some older Pokémon lack 'ko' names — log warning, fall back to transliteration placeholder (to be corrected manually)
- Varieties endpoint gives Mega / Alolan / Gmax / Paldea forms — treat as separate rows with id `dex*100 + form_number`

## ID mapping

PokeAPI's `varieties[]` has pokemon IDs like 10034 for "charizard-mega-x". Map to our scheme:
- Base pokemon: `dex * 100 + 0`
- Mega X: `dex * 100 + 1`
- Mega Y: `dex * 100 + 2`
- Alolan: `dex * 100 + 1` (for Pokémon with Alolan forms)
- Regional forms: increment based on order of appearance
- `form_of` points to the base form ID

Maintain this mapping in parsers/pokemon.ts. Hardcode exceptions if PokeAPI's ordering is ambiguous.

## Resume behavior

State file `.crawler-state.json` tracks which dex numbers / move IDs have been processed. On `--resume`, skip already-done IDs. Store under project root, gitignored.

## Change detection

Hash each row's content before upsert. If hash matches existing DB hash, skip the update (reduces write load).

Store hash in a side table `crawler_state` or extend existing tables with a `content_hash` column. Prefer side table to keep main schema clean.

## Rate limiting

Simple token bucket: 10 tokens/sec, wait if empty. Use p-throttle or hand-rolled.

## Scheduling stub

.github/workflows/crawl.yml:
- Runs every Sunday at 03:00 UTC
- Uses DATABASE_URL secret
- Runs `pnpm --filter @pokesearch/crawler crawl --all`
- Fails loudly if any step errors

Keep this workflow disabled until a production DB is set up — add a comment `# Enable after deployment`.

## Tests

packages/crawler/test/
├── parsers.test.ts       Feed recorded PokeAPI JSON fixtures, assert parsed output
└── id-mapping.test.ts    Exhaustive: every form in a fixture maps to correct dex*100+n

Fixtures in packages/crawler/test/fixtures/ — stored as .json files.

## Verification

- `pnpm crawl --pokemon` expands pokemons from 100 rows to 1000+ rows
- Existing rows (seeded in slice 4) upsert cleanly, no duplicates
- Mega / Alolan / etc. forms present with correct form_of FK
- Korean names populated for entries that have them in PokeAPI
- Sample query: `SELECT * FROM pokemons WHERE id = 33401` returns Mega Altaria with both names

## Legal

- User-Agent header identifies the app and contact email
- Respect PokeAPI's fair use
- Bulbapedia (if added later): check license for commercial use; may require explicit permission

## Out of scope

- Fetching images (PokeAPI sprites are accessed via jsdelivr URL at render time; we don't download them)
- Data validation beyond schema (assume PokeAPI correct; surface errors if they violate our types)
```
