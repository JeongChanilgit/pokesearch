# Product spec

## Target user

Anyone building or sharing competitive Pokémon teams — Singles, Doubles, VGC, Smogon tiers, casual — who wants a simple tool without account creation friction. Bilingual (English primary, Korean secondary).

## Key product decisions

- **No login.** Team and comment authorship proven by per-item password (bcrypt). Inspired by legacy Korean community boards.
- **Bilingual UI and search.** User picks English or Korean. Pokémon / move / ability / item names displayed in the chosen language. Search accepts both.
- **Format-agnostic.** Teams declare their own `level` (50 or 100). The platform does not enforce any specific competitive format, tier, or ruleset.
- **Mobile first.** Web PWA. Structured for future React Native app (shared business logic via `packages/`).

## Information architecture

Bottom tab navigation with 3 destinations:
- **View Teams** (default)
- **Create Team**
- **Quick Search**

Team detail and modals use stack push (with back button). Tab switching preserves stack state per tab.

Locale selector in header / settings, persists to cookie `NEXT_LOCALE`.

---

## Screen 1 — View Teams (Home)

### Goal

On app open, user immediately sees popular shared teams.

### Elements

- Header: app name + locale toggle (EN | KO)
- Sort dropdown: Most liked (default) / Most viewed / Newest / Most commented
- Filter dropdown: filter by included Pokémon
- Infinite-scroll team card list (20 per page)
  - Team name (as entered by creator — not translated)
  - 6 Pokémon sprite thumbnails (PokeAPI)
  - View / like / comment counts

### Acceptance

- Skeleton cards while loading
- Empty state with CTA: "No teams yet — be the first to create one" (translated)
- Card tap → team detail (stack push)
- Locale toggle re-renders labels immediately without full reload

---

## Screen 2 — Team detail

### Goal

Inspect every Pokémon's full build at a glance. Comment and like.

### Elements

- Team name (plain header — no format tags)
- Like button (heart, shows count) + view / comment counts
- **Edit / Delete buttons** (open password confirm modal)
- Pokémon card × up to 6, each containing:
  - Sprite + name (in current locale) + species badge
  - Ability / item / nature (one-line summary, localized)
  - **Three key metric cards**: Physical bulk / Special bulk / Speed
  - Stat bars showing base-derived value and EV-derived value
  - Up to 4 moves, each with current damage output
- Comments section (see screen 9)

### Acceptance

- Bulk / speed / damage values computed from this team's own EV / nature settings.
- Likes limited once per client fingerprint (IP + UA hash).
- View count +1 per session per team (session cookie dedup).
- Pokémon names switch between `name_en` / `name_ko` based on current locale.

---

## Screen 3 — Quick Search

### Goal

Look up theoretical values (bulk, speed, damage per move) for any Pokémon in MIN / NORM / MAX ranges. No team context.

### Elements

- Search input — accepts both English and Korean names
- Search result:
  - Pokémon header: sprite + name (in current locale) + type badges + weaknesses / resistances
  - MIN / NORM / MAX definitions legend
  - Physical bulk MIN / NORM / MAX
  - Special bulk MIN / NORM / MAX
  - Speed MIN / NORM / MAX (actual stat)
  - Every learnable attacking move's damage output MIN / NORM / MAX
- Level selector (50 / 100) — affects all calculated values live

### Bilingual search rules

- Query "Charizard" → finds `리자몽`; displays in current locale.
- Query "리자몽" → finds Charizard; displays in current locale.
- Autocomplete dropdown shows the name matching the query language, plus the other language in muted text.

### MIN / NORM / MAX definitions

- MIN = reducing nature + 0 EV
- NORM = neutral nature + 0 EV
- MAX = boosting nature + 252 EV
- (IV fixed at 31 across all three — perfect IVs assumed)

### Acceptance

- With empty input, show "Recent searches" list (localStorage, max 5).
- No match → "Pokémon not found" (translated).
- Only attacking moves (physical / special). Status moves excluded.
- Changing level (50 / 100) recomputes all values within 100 ms.

---

## Screen 4 — Create Team (empty state)

### Goal

Starting point for a new team.

### Elements

- Team name input (max 60 chars) — typed in whatever language the user prefers, NOT translated
- Description textarea (optional, max 500 chars)
- `level` selector (50 / 100, default 50)
- "No Pokémon yet" empty card
- **+ Add Pokémon** button (max 6)
- Save button (disabled if name empty OR 0 Pokémon)

### Acceptance

- Empty team name → save button disabled
- At 6 Pokémon → hide the add button

---

## Screen 5 — Pokémon picker modal

### Goal

Choose a Pokémon to add to a slot.

### Elements

- Search input (bilingual, same rules as Quick Search)
- Filter chips: All / By generation / Forms (Mega / Gmax / Tera)
- Pokémon grid (sprites, 4 columns)
- Selected item shown with blue outline
- Cancel / Add buttons

### Acceptance

- One selection at a time
- Can add the same species multiple times to the team (different builds allowed)

---

## Screen 6 — Create Team (configured)

### Goal

Configure each Pokémon: ability, item, nature, EVs, moves.

### Elements per Pokémon card

- Sprite + name + Change button
- Ability dropdown (only abilities this Pokémon can have)
- Item dropdown (all items)
- Nature dropdown (25 natures, showing +/− stat hints)
- EV section (H / A / B / C / D / S):
  - 0–252 slider + number input
  - Running total with 510 cap warning
  - Live-computed actual stat beside each row
- Moves section (up to 4):
  - Move selector (only learnable moves for this Pokémon)
  - Live damage output per move beside each, reflecting current stats / nature / ability / item

### Acceptance

- EV total > 510 → block save + inline warning
- Ability change → re-fetch learnable moves (e.g. Pixilate reclassifies Normal moves)
- Save allowed with fewer than 4 moves
- Save allowed with fewer than 6 Pokémon

---

## Screen 7 — Save modal (password set)

### Goal

Set a one-time password for edit / delete rights.

### Elements

- Title: "Save team"
- Body: "Set a password. You'll need it later to edit or delete this team."
- Password input (masked, min 4 chars)
- Password confirm
- Warning block: "⚠ Password cannot be recovered"
- Cancel / Save buttons

### Acceptance

- Passwords must match
- Plain password sent over HTTPS; server bcrypt-hashes before storing
- Successful save → navigate to the new team's detail page + toast "Team saved"

---

## Screen 8 — Password confirm modal (edit / delete)

### Goal

Prove ownership before editing or deleting a team.

### Elements

- For edit: title "Edit team — enter password"
- For delete: title "Delete team" + warning block: "This cannot be undone. All comments and likes will also be removed."
- Password input
- Cancel / Edit (or Delete) button

### Acceptance

- Wrong password → inline error "Password doesn't match"
- 5 consecutive failures → 15-minute IP lockout (in-memory map; Redis later)
- Edit success → navigate to edit page with team pre-filled
- Delete success → navigate home + toast "Team deleted"

---

## Screen 9 — Comments

### Goal

Feedback on a team. Each comment independently deletable by its author.

### Elements

- Comment list (newest first):
  - Nickname + relative time ("2 hours ago" / "2시간 전")
  - Body
  - Delete button per comment
- Compose form:
  - Nickname input (max 20, default "Anonymous" / "익명")
  - Password input (for delete)
  - Content input (max 500)
  - Submit button

### Delete flow

Tap delete → inline password prompt → confirm.

### Acceptance

- Spam prevention: same IP cannot post 2 comments within 60 s
- Forbidden-word filter (env var `FORBIDDEN_WORDS` comma-separated)
- Relative time rendered via `Intl.RelativeTimeFormat` using current locale

---

## Common UX principles

- Every destructive action explicitly calls out irreversibility.
- Network-in-flight → button disabled + spinner.
- Error messages concrete ("Name too long, max 60 characters" — not "Server error").
- Minimum tap area 44×44 px on mobile.
- All user-visible strings go through i18n messages — never hardcoded in components.
