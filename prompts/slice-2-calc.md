# Slice 2 — Calculation package

## Goal

`packages/calc` exports pure functions for stats, bulk, damage, type chart, and MIN/NORM/MAX ranges. Full unit test coverage matching the worked examples in `docs/formulas.md`. Every function takes `level` as an explicit parameter.

## Prompt to send to Claude Code

```
Read @CLAUDE.md and @docs/formulas.md carefully.

Build out packages/calc. Directory layout:

packages/calc/src/
├── constants.ts         Named constants (BULK_COEFFICIENT = 0.411, STAB = 1.5)
├── nature.ts            Nature enum + multiplier lookup
├── stat.ts              Actual stat calculation (HP / non-HP)
├── bulk.ts              Physical and special bulk
├── damage.ts            Move damage output with ability + item multipliers
├── range.ts             MIN / NORM / MAX helpers
├── type-chart.ts        18×18 type effectiveness + getWeaknesses/Resistances
├── types.ts             Shared types (StatKey, NatureEffect, etc.)
└── index.ts             Barrel export

packages/calc/test/
├── stat.test.ts
├── bulk.test.ts
├── damage.test.ts
├── range.test.ts
└── type-chart.test.ts

## Function signatures (use exactly these)

```ts
// types.ts
export type StatKey = 'hp' | 'atk' | 'def' | 'spa' | 'spd' | 'spe';
export type NatureEffect = 'boost' | 'neutral' | 'reduce';
export type MoveCategory = 'physical' | 'special' | 'status';
export type TypeName =
  | 'normal' | 'fire' | 'water' | 'electric' | 'grass' | 'ice'
  | 'fighting' | 'poison' | 'ground' | 'flying' | 'psychic' | 'bug'
  | 'rock' | 'ghost' | 'dragon' | 'dark' | 'steel' | 'fairy';

// stat.ts
export function hpStat(base: number, iv: number, ev: number, level: number): number;
export function otherStat(
  base: number, iv: number, ev: number, level: number, nature: NatureEffect
): number;

// bulk.ts
export function physicalBulk(hp: number, def: number): number;
export function specialBulk(hp: number, spd: number): number;

// damage.ts
export interface DamageInput {
  attackStat: number;
  movePower: number;
  isSTAB: boolean;
  hasAdaptability?: boolean;
  abilityMultiplier?: number;  // defaults to 1
  itemMultiplier?: number;     // defaults to 1
}
export function damageOutput(input: DamageInput): number;

// range.ts
export interface StatRange { min: number; norm: number; max: number; }

export function statRange(base: number, level: number, isHp: boolean): StatRange;

export function bulkRange(
  hpBase: number, defBase: number, level: number, kind: 'physical' | 'special'
): StatRange;

export function damageRange(
  attackBase: number, level: number, movePower: number,
  isSTAB: boolean,
  opts?: { abilityMultiplier?: number; itemMultiplier?: number; hasAdaptability?: boolean }
): StatRange;

// type-chart.ts
export function typeEffectiveness(attacker: TypeName, defender: TypeName): number;
export function effectivenessAgainst(move: TypeName, target: TypeName[]): number;
export function getWeaknesses(types: TypeName[]): TypeName[];   // >= 2×
export function getResistances(types: TypeName[]): TypeName[];  // <= 0.5×
export function getImmunities(types: TypeName[]): TypeName[];   // 0×
```

## Implementation rules

- All floor ops use Math.floor() — never `| 0`
- Final return value is always an integer
- Intermediate math allowed in float; floor at the end only
- Negative inputs (base / IV / EV / level / power) throw TypeError
- Nature enum → multiplier: boost 1.1, neutral 1.0, reduce 0.9
- Adaptability replaces STAB 1.5 with 2.0; do not stack with regular STAB
- If ability or item multiplier undefined, treat as 1.0
- BULK_COEFFICIENT constant = 0.411
- Type chart: single-type attacker vs single-type target. Chain through `effectivenessAgainst` for dual-type targets (multiply).

## Test cases (minimum — expand as needed)

From `docs/formulas.md` worked examples:

### stat.test.ts

- Mega Altaria HP @ level 50 (base 75, IV 31, EV 4) → 151
- Mega Altaria C @ level 50 (base 110, IV 31, EV 244, boost) → 177
- Mega Altaria S @ level 50 (base 80, IV 31, EV 0, reduce) → 90
- Mega Altaria HP @ level 100 (same inputs) → 292
- Mega Altaria C @ level 100 → 348
- Mega Altaria S @ level 100 → 176
- Boundary: EV 0, 252; IV 0, 31
- Error: negative inputs throw TypeError

### bulk.test.ts

- Reuniclus physical bulk (HP 215, Def 75) → 39,233
- Reuniclus special bulk (HP 215, SpD 85) → 44,464
- Minimum bulk (HP 1, Def 1) → 2 (⌊1×1÷0.411⌋)

### damage.test.ts

- Mega Altaria Hyper Voice:
  { attackStat: 177, movePower: 90, isSTAB: true, abilityMultiplier: 1.2, itemMultiplier: 1.3 }
  → 37,276
- No STAB, no ability, no item: pure ⌊attack × power⌋
- Adaptability: sets STAB to 2.0 (do NOT stack with 1.5)

### range.test.ts

- Speed range for base 100 at level 50 (min reducing EV 0, max boosting EV 252)
- Physical bulk range for HP 100 / Def 100 at level 50

### type-chart.test.ts

- Charizard (fire/flying): weak to rock (4×), water, electric; resists fight, bug (0.5×), grass (0.25×); immune to ground
- Reuniclus (psychic): weak to fight, bug, ghost, dark; resists psychic, fight
- Single-type edge cases
- Immunity (0×) returned from getImmunities, not getResistances

## Vitest setup

- packages/calc/vitest.config.ts
- Install @vitest/coverage-v8
- `pnpm --filter @pokesearch/calc test` runs tests
- `pnpm --filter @pokesearch/calc test -- --coverage` shows 100% statement coverage

## Verification

- All tests pass
- 100% line and branch coverage for src/
- `pnpm typecheck` clean
- No runtime dependencies beyond what's needed (pure TS)

## Out of scope

- apps/web, packages/db, packages/types (next slice)
```

## Checkpoint

After this slice, you can call `damageOutput({...})` from anywhere and get trustworthy numbers. Next slice wires contracts so API routes and clients speak the same language.
