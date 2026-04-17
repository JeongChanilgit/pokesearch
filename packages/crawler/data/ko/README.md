# Korean translations

These JSON files contain hand-written Korean translations for every
Champions-legal entity. Showdown ships English only, so without these
files the crawler falls back to the English name and flags the slug as
"missing ko".

## Schema

Each file is a flat map of `slug → { name, description? }`.

```json
{
  "venusaur": { "name": "이상해꽃" },
  "charizardmegax": { "name": "메가리자몽 X" }
}
```

- `name` is required.
- `description` is only used for `abilities.json` and `items.json`.
- Slugs use Showdown's lowercase-alphanumeric convention (e.g.
  `charizardmegax`, not `charizard-mega-x`).

## Workflow

1. Run the crawler once with `--allow-missing-ko`:

   ```bash
   pnpm --filter @pokesearch/crawler crawl --allow-missing-ko
   ```

2. The crawler writes `data/ko/missing-slugs.txt` listing every slug
   without a Korean entry, alongside its English name.

3. Fill in the relevant JSON file(s).

4. Re-run without the flag:

   ```bash
   pnpm --filter @pokesearch/crawler crawl
   ```

   The crawler now fails fast if anything is still missing.

## item-effect-mult.json

Showdown doesn't expose damage multipliers as structured data, so any
numeric multipliers used by the calc engine (Life Orb 1.3x, Muscle Band
1.1x, etc.) are maintained by hand in
`packages/crawler/data/item-effect-mult.json`. Missing items default to
no multiplier.
