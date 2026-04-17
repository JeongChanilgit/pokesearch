# Database schema

PostgreSQL + Prisma.

Two logical zones:
- **User-generated** (`teams`, `team_pokemons`, `team_pokemon_moves`, `comments`, `likes`) — password-owned.
- **Master data** (`pokemons`, `moves`, `abilities`, `items`, `natures`, `pokemon_learnable_moves`) — read-only, maintained by the crawler.

Master data tables all have `name_en` and `name_ko` columns for bilingual display.

---

## User-generated tables

### `teams`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | `gen_random_uuid()` |
| `name` | varchar(60) | NOT NULL. User input, NOT translated. |
| `description` | text | nullable, max 500 chars (app-enforced) |
| `level` | smallint | NOT NULL, default 50. Typical values 50 or 100. |
| `password_hash` | varchar(60) | NOT NULL. bcrypt 10 rounds. |
| `views` | int | NOT NULL, default 0 |
| `likes_count` | int | NOT NULL, default 0. Denormalized counter. |
| `created_at` | timestamptz | NOT NULL, default `now()` |
| `updated_at` | timestamptz | NOT NULL, default `now()` |

Indexes:
- `(created_at DESC)`
- `(likes_count DESC, created_at DESC)` — hot path: home sort

### `team_pokemons`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `team_id` | uuid FK → teams | `ON DELETE CASCADE` |
| `slot_order` | smallint | NOT NULL, 1–6 |
| `pokemon_id` | int FK → pokemons | |
| `ability_id` | int FK → abilities | |
| `item_id` | int FK → items | nullable — no item allowed |
| `nature_id` | smallint FK → natures | |
| `ev_h, ev_a, ev_b, ev_c, ev_d, ev_s` | smallint | NOT NULL, default 0, 0–252 |
| `iv_h, iv_a, iv_b, iv_c, iv_d, iv_s` | smallint | NOT NULL, default 31, 0–31 |
| `tera_type` | varchar(16) | nullable |

Constraints:
- UNIQUE `(team_id, slot_order)`
- CHECK `ev_h + ev_a + ev_b + ev_c + ev_d + ev_s <= 510` (raw SQL in migration)

### `team_pokemon_moves`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `team_pokemon_id` | uuid FK → team_pokemons | `ON DELETE CASCADE` |
| `move_id` | int FK → moves | |
| `slot_order` | smallint | NOT NULL, 1–4 |

Constraints:
- UNIQUE `(team_pokemon_id, slot_order)`
- UNIQUE `(team_pokemon_id, move_id)` — no duplicate moves

### `comments`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `team_id` | uuid FK → teams | `ON DELETE CASCADE` |
| `nickname` | varchar(20) | NOT NULL. User input, NOT translated. |
| `password_hash` | varchar(60) | NOT NULL |
| `content` | text | NOT NULL, ≤ 500 chars (app-enforced) |
| `created_at` | timestamptz | NOT NULL |

Indexes: `(team_id, created_at DESC)`

### `likes`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `team_id` | uuid FK → teams | `ON DELETE CASCADE` |
| `client_fp` | varchar(64) | NOT NULL. `sha256(ip + user-agent)` |
| `created_at` | timestamptz | NOT NULL |

Constraints: UNIQUE `(team_id, client_fp)` — prevents duplicate likes.

---

## Master data tables

### `pokemons`

| Column | Type | Notes |
|---|---|---|
| `id` | int PK | `dex × 100 + form_number` (see ID scheme below) |
| `name_en` | varchar(32) | NOT NULL |
| `name_ko` | varchar(32) | NOT NULL |
| `types` | varchar(16)[] | NOT NULL, 1–2 elements, e.g. `['dragon','fairy']` |
| `base_h, base_a, base_b, base_c, base_d, base_s` | smallint | NOT NULL |
| `sprite_url` | varchar(200) | NOT NULL. PokeAPI sprite via jsdelivr. |
| `form_of` | int FK → pokemons | nullable. For Mega / Alolan / etc. points to base species. |

Indexes:
- GIN trigram on `name_en` (autocomplete)
- GIN trigram on `name_ko` (autocomplete)

### `moves`

| Column | Type | Notes |
|---|---|---|
| `id` | int PK | |
| `name_en` | varchar(32) | NOT NULL |
| `name_ko` | varchar(32) | NOT NULL |
| `type` | varchar(16) | NOT NULL, one of 18 types |
| `category` | enum | NOT NULL. `physical` / `special` / `status` |
| `power` | smallint | nullable (status moves) |
| `accuracy` | smallint | nullable |
| `pp` | smallint | NOT NULL |

### `abilities`

| Column | Type |
|---|---|
| `id` | int PK |
| `name_en` | varchar(32) |
| `name_ko` | varchar(32) |
| `description_en` | text |
| `description_ko` | text |

### `items`

| Column | Type | Notes |
|---|---|---|
| `id` | int PK | |
| `name_en` | varchar(32) | |
| `name_ko` | varchar(32) | |
| `description_en` | text | |
| `description_ko` | text | |
| `effect_mult` | jsonb | nullable. Used by damage calc. e.g. `{"physical": 1.5}` |

### `natures`

| Column | Type | Notes |
|---|---|---|
| `id` | smallint PK | 1–25 |
| `name_en` | varchar(16) | |
| `name_ko` | varchar(16) | |
| `boost_stat` | enum | nullable (null for neutral natures) |
| `reduce_stat` | enum | nullable |

### `pokemon_learnable_moves`

| Column | Type |
|---|---|
| `pokemon_id` | int FK → pokemons |
| `move_id` | int FK → moves |

PK: `(pokemon_id, move_id)`. Index: `pokemon_id`.

---

## Pokémon ID scheme

```
id = (dex_number × 100) + form_number
```

- Base form: `dex × 100 + 0`
- First alt form: `dex × 100 + 1`, and so on.

Examples:
- Charizard = `00600`
- Mega Charizard X = `00601`
- Mega Charizard Y = `00602`
- Pikachu = `02500`
- Alolan Raichu = `02601`

`form_of` FK points from the alt form back to the base form (for grouping).

---

## Prisma hints

- `varchar(N)` → `@db.VarChar(N)`
- `timestamptz` → `@db.Timestamptz(6)`
- bcrypt hash → `@db.VarChar(60)`
- Arrays → `String[]` or `Int[]` (Postgres array)
- `jsonb` → `Json`
- Composite unique → `@@unique([...])`
- CHECK constraints → raw SQL in migration files (Prisma does not support them)
- GIN trigram indexes → `CREATE INDEX USING gin` in migration files

## Notes on user content and i18n

- `teams.name`, `teams.description`, `comments.nickname`, `comments.content` are user-entered in whichever language the user chose. They are stored as-is and NEVER translated by the app.
- Only master data columns (`name_en`, `name_ko`, etc.) switch display based on UI locale.
