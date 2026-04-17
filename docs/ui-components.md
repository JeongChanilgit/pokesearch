# UI components

This file is the definitive source of truth for every UI component in the app. When implementing any screen, **match these patterns exactly**. Open `docs/mockups/reference.html` in a browser to see the final rendered design.

---

## Design tokens

### Colors — register in `tailwind.config.ts`

```ts
colors: {
  'bg-primary':     '#FFFFFF',
  'bg-secondary':   '#F5F5F3',
  'bg-tertiary':    '#EBEBE7',
  'text-primary':   '#1F1E1D',
  'text-secondary': '#6F6E6A',
  'text-tertiary':  '#9E9D98',
  'border-tertiary':  'rgba(31, 30, 29, 0.15)',
  'border-secondary': 'rgba(31, 30, 29, 0.3)',

  // Key metrics (team detail)
  'phys-bg': '#FAECE7', 'phys-fg': '#4A1B0C', 'phys-label': '#993C1D',
  'spec-bg': '#EEEDFE', 'spec-fg': '#26215C', 'spec-label': '#534AB7',
  'spd-bg':  '#E1F5EE', 'spd-fg':  '#04342C', 'spd-label':  '#0F6E56',

  // MIN / NORM / MAX
  'min-bg':  '#FCEBEB', 'min-fg':  '#501313', 'min-label':  '#A32D2D',
  'norm-bg': '#E6F1FB', 'norm-fg': '#042C53', 'norm-label': '#185FA5',
  'max-bg':  '#EAF3DE', 'max-fg':  '#173404', 'max-label':  '#3B6D11',

  // Stat bars
  'bar-base': '#85B7EB',
  'bar-ev':   '#1D9E75',

  // Nature arrows
  'nature-up':   '#0F6E56',
  'nature-down': '#A32D2D',

  // Category icons (move physical/special/status)
  'cat-phy':        '#D85A30',
  'cat-phy-border': '#712B13',
  'cat-spe':        '#534AB7',
  'cat-spe-inner':  '#CECBF6',
  'cat-spe-border': '#26215C',
  'cat-sta':        '#888780',
  'cat-sta-border': '#444441',

  // Like (heart)
  'like-liked-bg':     '#FBEAF0',
  'like-liked-fg':     '#D4537E',
  'like-liked-border': '#F4C0D1',

  // Actions
  'action':        '#378ADD',
  'danger-bg':     '#FCEBEB',
  'danger-fg':     '#A32D2D',
  'danger-border': '#F09595',
  'warn-bg':       '#FAEEDA',
  'warn-fg':       '#633806',
}
```

### Type badge colors

One entry per type. Use the type name as Tailwind class suffix: `.t-fire`, `.t-water`, etc.

```ts
typeBadges: {
  normal:   { bg: '#F1EFE8', fg: '#444441' },
  fire:     { bg: '#FAECE7', fg: '#712B13' },
  water:    { bg: '#E6F1FB', fg: '#0C447C' },
  grass:    { bg: '#EAF3DE', fg: '#27500A' },
  electric: { bg: '#FAEEDA', fg: '#633806' },
  ice:      { bg: '#E6F1FB', fg: '#185FA5' },
  fighting: { bg: '#FAECE7', fg: '#4A1B0C' },
  poison:   { bg: '#FBEAF0', fg: '#993556' },
  ground:   { bg: '#FAEEDA', fg: '#633806' },
  flying:   { bg: '#E6F1FB', fg: '#185FA5' },
  psychic:  { bg: '#FBEAF0', fg: '#72243E' },
  bug:      { bg: '#EAF3DE', fg: '#3B6D11' },
  rock:     { bg: '#F1EFE8', fg: '#444441' },
  ghost:    { bg: '#EEEDFE', fg: '#3C3489' },
  dragon:   { bg: '#EEEDFE', fg: '#26215C' },
  dark:     { bg: '#F1EFE8', fg: '#2C2C2A' },
  steel:    { bg: '#F1EFE8', fg: '#444441' },
  fairy:    { bg: '#FBEAF0', fg: '#993556' },
}
```

### Typography

- Font: `Pretendard Variable`, fallback `system-ui`
- Numbers: always `font-variant-numeric: tabular-nums`
- Sizes: header 14px / body 13px / label 11px / caption 10px / micro 9px
- Weights: 400 and 500 only
- Line height: 1.6 for body, 1.4 for compact lists

---

## SVG icon symbols

Add to a shared `components/Icons.tsx` as symbol definitions. Reference via `<use href="#id">`.

```tsx
export function IconDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }}>
      <defs>
        {/* Nav icons */}
        <symbol id="i-list" viewBox="0 0 24 24">
          <rect x="3" y="4"  width="18" height="4" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5"/>
          <rect x="3" y="10" width="18" height="4" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5"/>
          <rect x="3" y="16" width="18" height="4" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5"/>
        </symbol>
        <symbol id="i-plus" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </symbol>
        <symbol id="i-search" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="6" fill="none" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </symbol>

        {/* Move category icons */}
        <symbol id="cat-phy" viewBox="0 0 14 14">
          <rect x="2" y="3" width="10" height="8" rx="1.5" fill="#D85A30" stroke="#712B13" strokeWidth="0.5"/>
        </symbol>
        <symbol id="cat-spe" viewBox="0 0 14 14">
          <circle cx="7" cy="7" r="5.5" fill="#534AB7" stroke="#26215C" strokeWidth="0.5"/>
          <circle cx="7" cy="7" r="2" fill="#CECBF6"/>
        </symbol>
        <symbol id="cat-sta" viewBox="0 0 14 14">
          <polygon points="7,1.5 12,4.5 12,9.5 7,12.5 2,9.5 2,4.5" fill="#888780" stroke="#444441" strokeWidth="0.5"/>
        </symbol>
      </defs>
    </svg>
  );
}
```

Mount `<IconDefs />` once in the root layout.

For category icon usage:

```tsx
<svg width={14} height={14}><use href="#cat-phy" /></svg>
<svg width={14} height={14}><use href="#cat-spe" /></svg>
<svg width={14} height={14}><use href="#cat-sta" /></svg>
```

Mapping from DB move category:
- `physical` → `cat-phy`
- `special` → `cat-spe`
- `status` → `cat-sta`

---

## Core components

### 1. Phone viewport / page wrapper

All pages use the same shell. In `app/[locale]/layout.tsx`:

```tsx
<body className="min-h-screen bg-bg-tertiary">
  <div className="mx-auto max-w-[480px] min-h-screen bg-bg-primary flex flex-col">
    <header>...</header>
    <main className="flex-1 p-3">{children}</main>
    <BottomNav />
  </div>
</body>
```

- Content max-width 480px, centered
- Edge padding 12–16px
- Bottom nav respects `safe-area-inset-bottom`

### 2. Bottom navigation

```tsx
<nav className="border-t border-border-tertiary bg-bg-primary pt-1.5 pb-2.5 grid grid-cols-3" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 10px)' }}>
  <NavItem href="/" icon="i-list" label={t('nav.viewTeams')} active={pathname === '/'} />
  <NavItem href="/teams/new" icon="i-plus" label={t('nav.createTeam')} active={...} />
  <NavItem href="/search" icon="i-search" label={t('nav.quickSearch')} active={...} />
</nav>
```

```tsx
function NavItem({ href, icon, label, active }: Props) {
  return (
    <Link href={href} className={`text-center text-[10px] ${active ? 'text-text-primary font-medium' : 'text-text-tertiary'}`}>
      <svg width={18} height={18} className="block mx-auto mb-0.5"><use href={`#${icon}`} /></svg>
      {label}
    </Link>
  );
}
```

### 3. Locale toggle (header)

```tsx
<div className="text-[10px] text-text-secondary px-1.5 py-0.5 border border-border-tertiary rounded-[10px]">
  <span className={locale === 'en' ? 'text-text-primary font-medium' : ''}>EN</span>
  <span className="mx-1">·</span>
  <span className={locale === 'ko' ? 'text-text-primary font-medium' : ''}>KO</span>
</div>
```

Tapping swaps locale via router.push with new path prefix.

### 4. Team card (home list)

```tsx
<Link href={`/teams/${team.id}`} className="block border border-border-tertiary rounded-lg p-[9px]">
  <div className="text-[11px] font-medium mb-[5px]">{team.name}</div>
  <div className="flex gap-[3px] mb-[5px]">
    {team.pokemons.map((p) => (
      <img key={p.id} src={p.spriteUrl} alt="" width={22} height={22} className="object-contain" />
    ))}
  </div>
  <div className="flex gap-2.5 text-[9px] text-text-secondary">
    <span>{team.views} views</span>
    <span>♡ {team.likes}</span>
    <span>{team.commentCount} comments</span>
  </div>
</Link>
```

### 5. Pokémon sprite with item overlay

Reusable component `<PokemonHolder>`:

```tsx
interface Props { pokemonId: number; itemName?: string; size?: 32 | 44; }

export function PokemonHolder({ pokemonId, itemName, size = 44 }: Props) {
  const itemSize = Math.round(size * 0.45);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <img
        src={`https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/${pokemonId}.png`}
        alt=""
        className="w-full h-full object-contain"
      />
      {itemName && (
        <img
          src={`https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/items/${itemName}.png`}
          alt=""
          className="absolute bottom-[-3px] right-[-3px] bg-bg-primary border border-border-tertiary rounded-full box-border"
          style={{ width: itemSize, height: itemSize, padding: 1 }}
        />
      )}
    </div>
  );
}
```

`itemName` takes lower-case hyphenated PokeAPI item slug: `life-orb`, `choice-specs`, `leftovers`, etc.

### 6. Key metric card (bulk / speed)

Team detail, three variants:

```tsx
<div className="grid grid-cols-3 gap-[5px] my-[7px]">
  <div className="bg-phys-bg rounded-md px-1 py-[5px] text-center">
    <div className="text-[9px] text-phys-label">{t('teamDetail.physBulk')}</div>
    <div className="text-[13px] font-medium text-phys-fg tabular-nums mt-px">{physBulk.toLocaleString()}</div>
  </div>
  <div className="bg-spec-bg rounded-md px-1 py-[5px] text-center">
    <div className="text-[9px] text-spec-label">{t('teamDetail.specBulk')}</div>
    <div className="text-[13px] font-medium text-spec-fg tabular-nums mt-px">{specBulk.toLocaleString()}</div>
  </div>
  <div className="bg-spd-bg rounded-md px-1 py-[5px] text-center">
    <div className="text-[9px] text-spd-label">{t('teamDetail.speed')}</div>
    <div className="text-[13px] font-medium text-spd-fg tabular-nums mt-px">{speed}</div>
  </div>
</div>
```

### 7. Stat row (5-column grid — CRITICAL alignment)

```tsx
<div className="grid items-center gap-1 text-[10px] py-0.5 tabular-nums"
     style={{ gridTemplateColumns: '12px 1fr 10px 30px 44px' }}>
  <span className="text-text-secondary font-medium text-center">H</span>
  <div className="h-[4px] bg-bg-secondary rounded-sm overflow-hidden flex">
    <div className="h-full bg-bar-base" style={{ width: `${baseFraction * 100}%` }} />
    <div className="h-full bg-bar-ev"   style={{ width: `${evFraction * 100}%` }} />
  </div>
  <span className="text-center font-medium">{natureArrow}</span>
  <span className="text-right text-text-primary font-medium">{finalStat}</span>
  <span className="text-right text-text-tertiary text-[9px]">EV {ev}</span>
</div>
```

- `natureArrow`: `↑` (class `text-nature-up`) / `↓` (class `text-nature-down`) / empty string.
- `baseFraction` = (actual stat without EVs) / 200, clamped 0–1.
- `evFraction` = (final actual stat - base actual stat) / 200, clamped.
- Always render `EV 0` when EVs are 0 — don't hide the cell.
- Always render 6 rows in order: H, A, B, C, D, S.

### 8. Move row (team detail / create)

Single damage number variant:

```tsx
<div className="grid items-center gap-[7px] px-2 py-[5px] bg-bg-secondary rounded-sm text-[10px] mb-[3px]"
     style={{ gridTemplateColumns: '14px 1fr auto' }}>
  <svg width={14} height={14}><use href={`#cat-${move.category}`} /></svg>
  <span className="truncate">
    {displayMoveName(move, locale)}
    <span className="text-text-tertiary text-[9px]"> · {move.power ?? t('common.statusMove')}</span>
  </span>
  {move.category === 'status' ? (
    <span className="text-text-tertiary text-[9px] italic">—</span>
  ) : (
    <span className="text-[#0C447C] font-medium tabular-nums">{damage.toLocaleString()}</span>
  )}
</div>
```

Category icons are defined in the SVG symbols section above. Damage value color is `#0C447C` (blue-800 — same as NORM-foreground).

### 9. Quick-search move card (with MIN/NORM/MAX)

Two-part card, sorted by `max` descending:

```tsx
<div className="border border-border-tertiary rounded-sm px-2 py-1.5 mb-1">
  <div className="flex items-center gap-1.5 text-[10px] mb-1">
    <svg width={14} height={14}><use href={`#cat-${move.category}`} /></svg>
    <span className="font-medium">{displayMoveName(move, locale)}</span>
    <span className="text-text-tertiary text-[9px]">· {move.type} · {move.power}</span>
  </div>
  <div className="grid grid-cols-3 gap-1 text-center">
    <div className="bg-min-bg rounded-sm px-[2px] py-1">
      <div className="text-[11px] font-medium text-min-fg tabular-nums">{damage.min.toLocaleString()}</div>
    </div>
    <div className="bg-norm-bg rounded-sm px-[2px] py-1">
      <div className="text-[11px] font-medium text-norm-fg tabular-nums">{damage.norm.toLocaleString()}</div>
    </div>
    <div className="bg-max-bg rounded-sm px-[2px] py-1">
      <div className="text-[11px] font-medium text-max-fg tabular-nums">{damage.max.toLocaleString()}</div>
    </div>
  </div>
</div>
```

Sort order: server returns moves sorted by `damage.max` descending.

### 10. MIN / NORM / MAX badge row (bulk / speed sections)

```tsx
<div className="grid grid-cols-3 gap-1 text-center mb-1.5">
  <div className="bg-min-bg rounded-sm px-[2px] py-1">
    <div className="text-[8px] tracking-wider text-min-label">MIN</div>
    <div className="text-[11px] font-medium text-min-fg tabular-nums mt-px">{min.toLocaleString()}</div>
  </div>
  <div className="bg-norm-bg rounded-sm px-[2px] py-1">
    <div className="text-[8px] tracking-wider text-norm-label">NORM</div>
    <div className="text-[11px] font-medium text-norm-fg tabular-nums mt-px">{norm.toLocaleString()}</div>
  </div>
  <div className="bg-max-bg rounded-sm px-[2px] py-1">
    <div className="text-[8px] tracking-wider text-max-label">MAX</div>
    <div className="text-[11px] font-medium text-max-fg tabular-nums mt-px">{max.toLocaleString()}</div>
  </div>
</div>
```

### 11. MIN/NORM/MAX definitions legend (Quick Search)

```tsx
<div className="bg-bg-secondary rounded-sm px-2 py-1.5 text-[9px] text-text-secondary leading-relaxed">
  <b className="text-min-label">MIN</b> {t('search.minDef')}
  <span className="mx-1">·</span>
  <b className="text-norm-label">NORM</b> {t('search.normDef')}
  <span className="mx-1">·</span>
  <b className="text-max-label">MAX</b> {t('search.maxDef')}
</div>
```

Messages:
- `search.minDef`: "reducing·0" / "하향·0"
- `search.normDef`: "neutral·0" / "중립·0"
- `search.maxDef`: "boosting·252" / "상향·252"

### 12. Weakness / resistance / immunity row

Three stacked lines. Each line: label (bold) + badges.

```tsx
<div className="text-[9px] text-text-secondary leading-[1.6] mb-2">
  <div>{t('search.weak')} &nbsp;
    {weaknesses.map((w) => (
      <TypeBadge key={w.type} type={w.type} suffix={w.multiplier === 4 ? ` ×4` : ''} />
    ))}
  </div>
  <div>{t('search.resist')} &nbsp;
    {resistances.map((r) => <TypeBadge key={r} type={r} />)}
  </div>
  {immunities.length > 0 && (
    <div>{t('search.immune')} &nbsp;
      {immunities.map((t) => <TypeBadge key={t} type={t} />)}
    </div>
  )}
</div>
```

Only show the "Immune" line if there are any immunities.

### 13. Type badge

```tsx
export function TypeBadge({ type, suffix = '' }: Props) {
  return (
    <span className={`inline-block px-1.5 py-[1px] rounded-sm text-[9px] font-medium mr-[3px] t-${type}`}>
      {capitalize(type)}{suffix}
    </span>
  );
}
```

Type class (`t-fire`, `t-water`, etc.) maps to the color pair from the `typeBadges` config above.

### 14. Level toggle

```tsx
<div className="inline-flex gap-0.5 p-0.5 bg-bg-secondary rounded-md text-[10px]">
  <button onClick={() => setLevel(50)}  className={`px-2.5 py-[3px] rounded-sm ${level === 50  ? 'bg-bg-primary text-text-primary font-medium' : 'text-text-secondary'}`}>50</button>
  <button onClick={() => setLevel(100)} className={`px-2.5 py-[3px] rounded-sm ${level === 100 ? 'bg-bg-primary text-text-primary font-medium' : 'text-text-secondary'}`}>100</button>
</div>
```

### 15. Pokémon picker list item (modal)

```tsx
<button onClick={() => onSelect(pokemon.id)}
        className={`flex items-center gap-2 px-2 py-[5px] text-[10px] border-b border-border-tertiary last:border-b-0 w-full text-left ${selected ? 'bg-[#E6F1FB]' : ''}`}>
  <img src={pokemon.spriteUrl} alt="" width={22} height={22} className="object-contain" />
  <div className="flex-1">
    <div className="text-text-primary">{pokemon.nameEn}</div>
    <div className="text-text-tertiary text-[9px]">{pokemon.nameKo}</div>
  </div>
</button>
```

Wrap the list in:

```tsx
<div className="flex flex-col border border-border-tertiary rounded-sm max-h-[220px] overflow-y-auto">
  {pokemons.map(...)}
</div>
```

### 16. Modal (overlay + card)

```tsx
<div className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-4">
  <div className="bg-bg-primary rounded-lg p-4 w-full max-w-[240px]">
    <div className="text-[13px] font-medium mb-1">{title}</div>
    <div className="text-[10px] text-text-secondary mb-2.5 leading-snug">{description}</div>
    {/* fields */}
    <div className="flex gap-1.5 mt-2.5">
      <button className="flex-1 py-[7px] text-[11px] ...">Cancel</button>
      <button className="flex-1 py-[7px] text-[11px] ...">Confirm</button>
    </div>
  </div>
</div>
```

Max-width 240px matches the reference. Backdrop opacity is `rgba(0,0,0,0.55)` (= Tailwind `bg-black/55`).

### 17. Warning / danger blocks inside modals

```tsx
<div className="bg-warn-bg rounded-sm px-2 py-1.5 text-[9px] text-warn-fg leading-snug">
  ⚠ {t('save.passwordUnrecoverable')}
</div>

<div className="bg-danger-bg rounded-sm px-2 py-1.5 text-[9px] text-danger-fg leading-snug mb-2">
  ⚠ {t('delete.cascadeWarning')}
</div>
```

### 18. Like button

```tsx
<button className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[14px] text-[10px] border
                    ${liked
                      ? 'bg-like-liked-bg text-like-liked-fg border-like-liked-border'
                      : 'bg-transparent text-text-secondary border-border-tertiary'}`}>
  ♡ {count}
</button>
```

### 19. Comment item

```tsx
<div className="bg-bg-secondary rounded-sm px-2 py-1.5 text-[10px] mb-1">
  <div className="flex justify-between text-[9px] text-text-secondary mb-0.5">
    <span>{nickname} · {relativeTime}</span>
    <button className="text-danger-fg">{t('comments.delete')}</button>
  </div>
  <div className="text-text-primary">{content}</div>
</div>
```

### 20. Comment composer

```tsx
<div className="grid grid-cols-2 gap-1.5 mb-1.5">
  <input className="pr-inp text-[10px]" placeholder={t('comments.nicknamePlaceholder')} />
  <input className="pr-inp text-[10px]" type="password" placeholder={t('comments.passwordPlaceholder')} />
</div>
<textarea className="pr-inp text-[10px]" rows={2} style={{ resize: 'none' }} placeholder={t('comments.contentPlaceholder')} />
<button className="w-full mt-1.5 py-[7px] text-[11px] bg-text-primary text-bg-primary rounded-sm">{t('comments.submit')}</button>
```

### 21. Empty state

```tsx
<div className="border border-dashed border-border-tertiary rounded-lg px-2.5 py-[22px] text-center text-[11px] text-text-tertiary">
  {t('create.noPokemonYet')}<br />
  <span className="text-text-secondary">{t('create.addOneToBegin')}</span>
</div>
```

---

## Section heading

Used before every subsection like "Physical bulk", "EVs", "Moves":

```tsx
<div className="text-[10px] text-text-secondary font-medium mt-2 mb-[5px] flex justify-between items-center">
  <span>{t('teamDetail.evs')}</span>
  <span className="text-[9px] text-text-tertiary font-normal">{t('create.evsHint', { used: evTotal, max: 510 })}</span>
</div>
```

Right-side hint is optional; use for counters like "508 / 510", "sorted by max damage", etc.

---

## Spacing rhythm

- Card internal padding: `p-[9px]` (team detail cards) / `p-[8px]` (create team cards, picker items) / `p-4` (modals)
- Vertical gap between cards: `mb-1.5` (6px)
- Between sections within a card: `mt-2` (8px)
- Between form rows: `mb-1` (4px)

## Input styling

All inputs and textareas use this exact Tailwind class set:

```
border border-border-tertiary rounded-sm px-2.5 py-1.5 text-[11px] text-text-primary bg-bg-primary w-full box-border
```

Define as a utility class `pr-inp` in global CSS if reused often.

## Button styles

Default:
```
text-[10px] px-2.5 py-[5px] border border-border-tertiary rounded-sm bg-bg-primary text-text-primary
```

Primary (filled black):
```
bg-text-primary text-bg-primary border-text-primary
```

Primary disabled:
```
bg-bg-secondary text-text-tertiary border-border-tertiary
```

Danger:
```
text-danger-fg border-danger-border bg-danger-bg
```

Dashed (add-pokemon buttons):
```
border-dashed w-full py-[8–10px]
```

---

## Implementation checklist

When building any screen, verify:

- [ ] Every visible string maps to an i18n message key (no hardcoded text)
- [ ] All 6 stats rendered in H/A/B/C/D/S order, EV always shown (0 not hidden)
- [ ] All 4 move slots rendered; status moves show `—` instead of damage number
- [ ] Category icon (phy/spe/sta) present left of every move name
- [ ] Pokémon sprite uses `<PokemonHolder>` with itemName for held items
- [ ] Numbers rendered with `.toLocaleString()` — never raw (e.g. `37,476` not `37476`)
- [ ] Korean and English layouts both tested at 360px viewport
- [ ] All tap targets ≥ 44×44 px
- [ ] Moves in Quick Search sorted by `damage.max` descending
- [ ] Weakness / resistance / immunity all shown (immunity line hidden if empty)
