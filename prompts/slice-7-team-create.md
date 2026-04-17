# Slice 7 — Create team

## Goal

Create a new team end-to-end. Pick Pokémon, configure each, save with password.

## Prompt to send to Claude Code

```
Read @CLAUDE.md, @docs/spec.md (screens 4-7), @docs/i18n.md,
@docs/ui-components.md, @docs/formulas.md.

VISUAL TARGET: Open @docs/mockups/reference.html — screens 4 (empty), 5 (picker modal), 6 (configured), 7 (save modal) are the exact pixel targets.

Notable references in ui-components.md:
- §15 Pokémon picker list item (modal)
- §16 Modal overlay + card (used for picker and save)
- §17 Warning block (⚠ Password cannot be recovered)
- §8 Move row with category icon and live damage
- §6 Key metric / stat rows with bars
- §14 Level toggle (50 / 100)

Implement team creation.

## 1. APIs

POST /api/teams
  Body: CreateTeamRequest (from packages/types)
  Server bcrypt-hashes password, inserts team + team_pokemons + moves in a transaction
  Returns CreateTeamResponse { id }

GET /api/pokemons?q=&gen=&form=
  Bilingual search for the picker modal. Returns PokemonSummary[].

GET /api/pokemons/:id/learnable-moves
  Returns moves this Pokémon can learn (respecting current ability if provided as query).

GET /api/abilities?pokemonId=
GET /api/items
GET /api/natures

## 2. Page

apps/web/app/[locale]/teams/new/page.tsx
  Client-heavy page — lots of interactive form state.
  Wrap with 'use client'.

## 3. Components

Reuse from previous slices: `PokemonHolder`, `TypeBadge`, icon symbols, `LevelToggle`, `MoveRow`, `StatRow`, `KeyMetricsRow`.

Build new, matching ui-components.md:
- `components/TeamMetaForm.tsx` — name / description / level inputs (no format_note — that field was removed)
- `components/PokemonPickerModal.tsx` — wraps a list of PokemonPickerItem (ui-components.md §15) inside a modal (§16). Search + filter chips at top.
- `components/PokemonPickerItem.tsx` — single list row (§15). Sprite + EN name + KO name muted.
- `components/TeamPokemonEditor.tsx` — one Pokémon's full card. Header with PokemonHolder + Change button. Ability/Item/Nature as `.pr-sel` rows (see reference.html). EV section with 6 sliders. Moves section with live-damage rows.
- `components/EVSlider.tsx` — 3-column grid row (letter | slider | "{ev} · {final}{arrow}")
- `components/NatureSelector.tsx` — dropdown with "Nature name (C↑ S↓)" formatting
- `components/AbilityDropdown.tsx` — Pokémon-filtered
- `components/ItemDropdown.tsx` — all items
- `components/MoveSelectorRow.tsx` — uses MoveRow styling + dropdown behind the move name; shows live damage on the right
- `components/SaveModal.tsx` — follows §16 modal pattern + §17 warning block

## 4. State shape

```ts
type DraftTeam = {
  name: string;
  description: string;
  level: 50 | 100;
  pokemons: DraftPokemon[]; // 0-6
};

type DraftPokemon = {
  slotOrder: number;
  pokemonId: number;
  abilityId: number | null;
  itemId: number | null;
  natureId: number;
  evs: { h, a, b, c, d, s: number };
  ivs: { h, a, b, c, d, s: number };
  moves: { moveId: number; slotOrder: number }[];
  teraType: string | null;
};
```

Use useReducer with typed actions. No external state libraries.

## 5. Live damage calculation

Whenever EVs, nature, ability, item, or move changes:
- Compute actual stats via packages/calc (client-side import is fine — calc is pure)
- Display "current C: 177", "current damage: 36,720" etc. inline
- Should update within one animation frame

## 6. Ability change ripple

When ability changes to one that reclassifies moves (e.g. Pixilate, Pixel Power):
- Re-fetch learnable moves (some become Fairy-type, STAB changes, etc.)
- Existing selected moves that are no longer legal should be cleared with a toast warning

For v1, keep ability effect simple: ability_multiplier comes from a static lookup `(ability, move) => number`. Add this lookup in packages/calc/src/ability-multipliers.ts.

## 7. Save flow

Save button opens SaveModal.
- Password + confirm inputs
- Client validates length and match
- On submit → POST /api/teams with plain password (HTTPS only!)
- Server bcrypt-hashes + saves
- On 201 → router.push(`/${locale}/teams/${id}`) + toast "Team saved"

## 8. Validation

Both client (Zod via packages/types) and server (same schemas).
- Name 1-60 chars
- Description ≤ 500
- Password 4-64 chars
- At least 1 Pokémon, at most 6
- EV sum ≤ 510 per Pokémon
- Unique moves per Pokémon
- level ∈ {50, 100}

## 9. E2E test

apps/web/e2e/create-team.spec.ts
- Viewport 390×844
- Happy path: fill name → add 2 Pokémon → configure them → save with password → redirected to detail page → see the team
- Validation: try to save without name → button disabled
- Ability rip

## Acceptance

- Save completes under 1 second after submit
- Live damage updates without visible lag
- Both locales fully usable (test at least one full flow in Korean)
- Cancelling the save modal returns to the form with state intact
- All inline labels / errors translated

## Out of scope

- Editing existing teams (next slice)
- Deleting teams (next slice)
- Comments and likes (slice 9)
```
