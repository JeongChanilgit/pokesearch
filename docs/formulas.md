# Calculation formulas

All formulas take `level` as an explicit parameter. Common values:
- Level 50: VGC-style tournaments
- Level 100: Smogon tiers, most casual online battles

All intermediate values are integers. Every `⌊⌋` below means `Math.floor(...)` applied at exactly that point — not at the end. Floating-point creep ruins sums; be precise.

---

## 1. Actual stat (실수치)

### HP stat

```
HP = ⌊(2·B + IV + ⌊EV / 4⌋) × level / 100⌋ + level + 10
```

- `B`: base stat (종족값)
- `IV`: 0–31 (default 31)
- `EV`: 0–252 per stat, 510 total per Pokémon

### Non-HP stats (A / B / C / D / S)

```
raw = ⌊(2·B + IV + ⌊EV / 4⌋) × level / 100⌋ + 5
final = ⌊raw × natureMult⌋
```

- `natureMult`: 1.1 if boosted, 1.0 if neutral, 0.9 if reduced

### Worked example (Mega Altaria @ Level 50)

Base stats: HP 75 / C 110 / S 80. Nature: Quiet (C↑ S↓). IVs all 31.

| Stat | B | EV | Nature | Calculation | Final |
|---|---|---|---|---|---|
| HP | 75 | 4 | — | ⌊(150+31+1)×50/100⌋+60 = 91+60 | **151** |
| C  | 110 | 244 | ↑ | ⌊(220+31+61)×50/100⌋+5 = 156+5=161 → ⌊161×1.1⌋ | **177** |
| S  | 80 | 0 | ↓ | ⌊(160+31+0)×50/100⌋+5 = 95+5=100 → ⌊100×0.9⌋ | **90** |

### Worked example (Mega Altaria @ Level 100)

Same Pokémon, same config, at level 100:

| Stat | Calculation | Final |
|---|---|---|
| HP | ⌊(150+31+1)×100/100⌋+110 = 182+110 | **292** |
| C  | ⌊(220+31+61)×100/100⌋+5 = 312+5=317 → ⌊317×1.1⌋ | **348** |
| S  | ⌊(160+31+0)×100/100⌋+5 = 191+5=196 → ⌊196×0.9⌋ | **176** |

---

## 2. Bulk (내구력)

Opponent-independent metric for "how much damage this Pokémon can absorb".

### Physical bulk

```
physicalBulk = ⌊HP × Def ÷ 0.411⌋
```

### Special bulk

```
specialBulk = ⌊HP × SpD ÷ 0.411⌋
```

### Constant 0.411

This is a community convention that normalizes bulk to roughly the same units as damage output, making bulk-vs-damage comparisons meaningful. Alternative values seen in the wild: 0.41, 0.4096. **v1 uses 0.411 exactly.** To change, edit only `packages/calc/src/constants.ts`.

### Worked example (Reuniclus @ Level 50)

HP 215, Def 75, SpD 85 (all with full investment, neutral nature):

- physicalBulk = ⌊215 × 75 ÷ 0.411⌋ = ⌊39,233.58⌋ = **39,233**
- specialBulk = ⌊215 × 85 ÷ 0.411⌋ = ⌊44,464.72⌋ = **44,464**

---

## 3. Damage output (결정력)

Per-move damage metric. Opponent-independent (no type effectiveness, no critical hit).

### Formula

```
damage = ⌊Attack × MovePower × STAB × abilityMult × itemMult⌋
```

- `Attack`: A stat if physical move, C stat if special. Status moves have no damage output.
- `STAB`: 1.5 if move type matches Pokémon type, else 1.0. **Adaptability ability**: 2.0 instead of 1.5.
- `abilityMult`: conditional (see table below). Defaults to 1.0.
- `itemMult`: conditional. Defaults to 1.0.

### Ability multipliers (common)

| Ability | Condition | Multiplier |
|---|---|---|
| Pixilate / Fairy Skin | Normal moves become Fairy + boost | ×1.2 |
| Refrigerate / Freeze Skin | Normal → Ice + boost | ×1.2 |
| Aerilate / Sky Skin | Normal → Flying + boost | ×1.2 |
| Technician | Move power ≤ 60 | ×1.5 |
| Mega Launcher | Pulse / aura moves | ×1.5 |
| Iron Fist | Punching moves | ×1.2 |
| Steelworker | Steel-type moves | ×1.5 |
| Strong Jaw | Biting moves | ×1.5 |
| Adaptability | STAB moves (changes STAB itself to 2.0, do NOT stack) | — |

Ability multipliers apply only when their condition is met for the specific move. Store the conditions in `packages/calc/src/ability-multipliers.ts` as a `(move, ability) => number` function.

### Item multipliers (common)

| Item | Condition | Multiplier |
|---|---|---|
| Life Orb | Any damaging move | ×1.3 |
| Choice Band | Physical moves | ×1.5 |
| Choice Specs | Special moves | ×1.5 |
| Expert Belt | Super effective moves | ×1.2 (not applied in Quick Search — no target) |

### Worked example (Mega Altaria Hyper Voice @ Level 50)

- C stat: 177 (from §1)
- Move: Hyper Voice (Normal, power 90)
- Pixilate converts Normal → Fairy → Fairy matches Mega Altaria's Fairy type → STAB 1.5 applies
- Pixilate boost: ×1.2
- Life Orb: ×1.3

```
damage = ⌊177 × 90 × 1.5 × 1.2 × 1.3⌋
       = ⌊177 × 90 × 2.34⌋
       = ⌊37,276.02⌋
       = 37,276
```

---

## 4. MIN / NORM / MAX

Range display for Quick Search and stat comparisons.

| Tier | Nature | EV |
|---|---|---|
| MIN | Reducing (×0.9) | 0 |
| NORM | Neutral (×1.0) | 0 |
| MAX | Boosting (×1.1) | 252 |

IV is always 31 (perfect) across all tiers. EV 510 total cap is ignored — treat each stat independently for MIN / MAX calculations (this is the "theoretical max for this stat only").

### Bulk range

- Physical bulk MIN = `HP(EV 0) × Def(reducing, EV 0) / 0.411`
- Physical bulk NORM = `HP(EV 0) × Def(neutral, EV 0) / 0.411`
- Physical bulk MAX = `HP(EV 252) × Def(boosting, EV 252) / 0.411`
- (Likewise for special.)

HP has no boosting/reducing natures, so HP component only varies by EV investment.

### Damage range

Only the attacking stat (A or C) changes between MIN / NORM / MAX. Move power, ability, item multipliers are fixed.

---

## 5. Implementation checklist for `packages/calc`

- [ ] All floor ops use `Math.floor()`. Never `| 0` (32-bit truncation).
- [ ] Every function accepts `level` as an explicit parameter. No hidden defaults.
- [ ] Intermediate arithmetic may use float; only final return value is floored.
- [ ] Nature enum → multiplier lookup is a single table.
- [ ] Ability multiplier is a function `(move, ability) => number`, not a table lookup (because it depends on move properties).
- [ ] Item multiplier same pattern.
- [ ] Each formula has ≥ 3 unit tests including boundary values (EV 0, 252; level 50, 100).
- [ ] Match the worked examples above within ±1 (rounding differences tolerated).
- [ ] Negative inputs throw `TypeError`. Validation is caller's job.
