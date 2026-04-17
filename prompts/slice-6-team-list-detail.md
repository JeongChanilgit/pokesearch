# Slice 6 — Team list + detail (read-only)

## Goal

Browse shared teams and view details. Still no writes — creation comes next.

## Prompt to send to Claude Code

```
Read @CLAUDE.md, @docs/spec.md (screens 1 and 2), @docs/i18n.md,
@docs/ui-components.md, @docs/formulas.md.

VISUAL TARGET: Open @docs/mockups/reference.html — screens 1 and 2 are the exact pixel targets.
Team detail must match screen 2: all 6 stats shown in order (H/A/B/C/D/S) using the 5-column grid from ui-components.md §7, EV always displayed (including EV 0), nature arrows (↑/↓), all 4 move slots with category icons, Pokémon sprite with item overlay (§5).

Implement team list and detail, read-only.

## 1. API

GET /api/teams?sort=likes|views|created|comments&page=N&pokemonId=X
  Returns { teams: TeamSummary[], hasMore: boolean }
  Page size 20.

GET /api/teams/:id
  Returns full team with team_pokemons + moves + calculated key metrics
  Increment views (use a cookie `viewed_{id}` to dedupe per session)
  Response shape defined in packages/types/src/team.ts (add in slice 3 if missing)

## 2. Pages

apps/web/app/[locale]/page.tsx
  Team list home. Uses server component + api-client.
  Sort dropdown (likes/views/created/comments) updates URL param.
  Filter by Pokémon opens picker modal.
  Infinite scroll (IntersectionObserver, client component for the list body).

apps/web/app/[locale]/teams/[id]/page.tsx
  Team detail. Full server component — calculates key metrics on server using packages/calc.
  Pokémon cards stacked vertically with scroll.
  Comment section rendered but form/delete comes in slice 9.

## 3. Components to build

All components must match @docs/ui-components.md patterns exactly. Reuse from previous slices where possible.

- `components/TeamCard.tsx` — home list item (ui-components.md §4)
- `components/TeamPokemonCard.tsx` — detail card wrapping header + KeyMetricsRow + StatRows + MovesList
- `components/KeyMetricsRow.tsx` — Physical bulk / Special bulk / Speed trio (§6)
- `components/StatRow.tsx` — single 5-column stat row (§7). Takes `letter, finalStat, ev, natureEffect, baseFraction, evFraction`
- `components/StatTable.tsx` — renders 6 StatRows in order H/A/B/C/D/S
- `components/MoveRow.tsx` — single move with category icon + damage (§8). Status moves show `—`.
- `components/MovesList.tsx` — stack of MoveRows
- `components/LikeButton.tsx` — stub (display only); functional in slice 9

All labels via next-intl (home.*, teamDetail.*).

## 4. Key metric calculation

For each team_pokemon:
- Compute HP, Def, SpD, Speed actual stats via packages/calc using team.level
- Physical bulk, special bulk via packages/calc
- For each move: damageOutput using attack stat, item multiplier from items.effect_mult, ability multiplier (stub as 1.0 for now; real ability impact handled in slice 7 or 10)

Do this calculation on the server. Pass pre-calculated numbers to the client components.

## 5. Empty state

When no teams exist:
- Home shows CTA: "No teams yet — be the first" with a button linking to /[locale]/teams/new

## 6. View increment dedup

When rendering team detail:
- Check cookie `viewed_{teamId}` — if absent, update views +1 and set the cookie (path=/, max-age=30 min)
- Use cookies() from next/headers

## 7. Tests

apps/web/e2e/team-list-detail.spec.ts
- Home page renders seeded teams (add a "sample team" to seed for testing — include it in slice 4 seed if not already)
- Click a team → navigate to detail
- Detail shows 6 Pokémon cards with calculated bulk numbers
- Back button returns to list
- Locale toggle preserves page state

## Acceptance

- Pokémon names and stat labels are localized
- Team names and user-entered fields are shown as-is (not translated)
- All calculated metrics match packages/calc output
- Both locales pass the E2E
- Layout doesn't break with long Korean team names (use ellipsis if needed)

## Out of scope

- Creating / editing / deleting teams (next slices)
- Comments / likes actions (slice 9)
```

## Notes

- If seed doesn't have sample teams, add 2–3 realistic teams during slice 4 or at the start of this slice.
- The like button is non-functional here — just renders heart + count. Functional in slice 9.
