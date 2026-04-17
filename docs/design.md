# Design system

Mobile first. Design breakpoint: 360 px. Above 480 px, center the content with `max-width: 480px`.

Bilingual content. Layouts must stay stable when labels switch between English and Korean (Korean strings are often denser and wider).

## Color palette

Register these in `tailwind.config.ts` as the custom theme.

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

  // Stat categories (used in team detail key metric cards)
  'phys-bg': '#FAECE7',  'phys-fg': '#4A1B0C',  'phys-label': '#993C1D',
  'spec-bg': '#EEEDFE',  'spec-fg': '#26215C',  'spec-label': '#534AB7',
  'spd-bg':  '#E1F5EE',  'spd-fg':  '#04342C',  'spd-label':  '#0F6E56',

  // MIN / NORM / MAX tiers
  'min-bg':  '#FCEBEB',  'min-fg':  '#501313',  'min-label':  '#A32D2D',
  'norm-bg': '#E6F1FB',  'norm-fg': '#042C53',  'norm-label': '#185FA5',
  'max-bg':  '#EAF3DE',  'max-fg':  '#173404',  'max-label':  '#3B6D11',

  // Stat bar fills
  'bar-base': '#85B7EB',  // base-stat contribution
  'bar-ev':   '#1D9E75',  // EV contribution

  // Actions and semantics
  'action':          '#378ADD',
  'danger-bg':       '#FCEBEB',
  'danger-fg':       '#A32D2D',
  'danger-border':   '#F09595',
  'warn-bg':         '#FAEEDA',
  'warn-fg':         '#633806',
}
```

## Typography

- Primary font: **Pretendard Variable** (covers Latin + Hangul with consistent metrics).
- Fallback: `system-ui`, `-apple-system`, `sans-serif`.
- Numbers: always `font-variant-numeric: tabular-nums` for stat values.
- Body line-height: **1.6** (Hangul readability — English looks fine too).

Sizes:
- Header title: 14 px / 500
- Body: 13 px / 400
- Label: 11 px / 400
- Caption: 10 px / 400
- Numeric emphasis: 14 px / 500 (tabular)

Weights: only 400 and 500. Never 600 or 700 — too heavy against the host UI.

## Spacing

- Screen edge padding: 16 px
- Card interior padding: 12 px
- Section gap: 16 px
- Inter-element gap in a card: 8 px

## Component patterns

### Card

```
rounded-lg border border-border-tertiary bg-bg-primary p-3
```

### Chip (sort / filter)

```
rounded-md border border-border-tertiary px-2 py-1 text-caption text-text-secondary
```

### Default button

```
rounded-md border border-border-tertiary bg-bg-primary px-3 py-2 text-body
```

### Primary button (save, submit)

```
rounded-md bg-text-primary px-3 py-2 text-body text-bg-primary
```

### Danger button (delete)

```
rounded-md border border-danger-border bg-danger-bg px-3 py-2 text-body text-danger-fg
```

### Key metric card (bulk / speed — team detail)

```html
<div class="bg-phys-bg rounded-md px-1 py-2 text-center">
  <div class="text-[9px] text-phys-label tracking-wide">{t('teamDetail.physicalBulk')}</div>
  <div class="text-[12px] font-medium text-phys-fg tabular-nums">30,140</div>
</div>
```

Reuse with `spec-*` and `spd-*` classes.

### MIN / NORM / MAX badge

```html
<div class="bg-min-bg rounded-sm px-1 py-1 text-center">
  <div class="text-[8px] text-min-label tracking-wider">MIN</div>
  <div class="text-[11px] font-medium text-min-fg tabular-nums">21,300</div>
</div>
```

## Bottom navigation

Fixed height 56 px. Three equal-width tabs. Respect `safe-area-inset-bottom` (iOS notch).

- Left: View Teams (`List` icon from lucide-react)
- Center: Create Team (`PlusCircle`)
- Right: Quick Search (`Search`)

Active tab: full-opacity text, thin top bar indicator.

## Locale toggle placement

- Header (top-right): small "EN | KO" inline toggle.
- Also accessible in a future Settings screen.
- Changing locale must not unmount the current page — use client-side routing with the new locale prefix.

## i18n layout considerations

- Korean strings tend to be **10–20% narrower per character** but the block width often ends up similar because Korean has no spaces.
- For buttons and tabs, prefer strings ≤ 8 characters in either language.
- Avoid wrapping labels. If a label can wrap in Korean but not in English (or vice versa), shorten one.
- In Playwright, test both locales for layout stability.
- Test with browser default font size at 1x and 1.25x to catch overflow.

## Scroll behavior

- Team detail's Pokémon cards: vertical scroll.
- Comments: inline at bottom of detail (not a separate tab).
- Pokémon picker modal: independent scroll (parent locked).

## Accessibility

- Minimum tap target 44 × 44 px. Especially watch comment delete buttons.
- Never encode information with color alone. MIN / NORM / MAX always show the label text.
- Focus ring: `focus-visible:ring-2 ring-action`.
- Verify with VoiceOver (iOS) and TalkBack (Android) once a native app is added.

## Dark mode

Not in v1. Deferred to a later phase. Keep the palette in a single location to make dark-mode addition a one-file change.

## Motion

Light, subtle, never decorative:
- Modal fade-in: 150 ms.
- Button `active:scale-[0.98]`.
- Stat bar width transition: 200 ms.
- Route transitions: none (preserves native feel).

## Mockup images

Saved under `docs/mockups/`:

```
01-team-list.png
02-team-detail.png
03-quick-search.png
04-team-create-empty.png
05-pokemon-picker-modal.png
06-team-create-filled.png
07-save-modal.png
08-password-confirm-modal.png
09-comments.png
```

Mockups were originally drawn with Korean labels. When implementing, every visible string maps to an i18n message key. Check `docs/i18n.md` for the key namespace convention.
