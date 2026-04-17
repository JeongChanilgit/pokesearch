# PokeSearch — Claude Code starter kit

Bilingual (English / Korean) Pokémon team sharing platform. Mobile web first, architected for future native mobile app.

## How to use this starter

```bash
# 1. Create your project folder and drop these files in
mkdir pokesearch && cd pokesearch
unzip /path/to/pokesearch-starter.zip -d .
mv pokesearch-starter/* pokesearch-starter/.[!.]* . 2>/dev/null
rmdir pokesearch-starter

# 2. Save the 9 mockup images into docs/mockups/
mkdir -p docs/mockups
# Save: 01-team-list.png through 09-comments.png

# 3. Initialize git
git init && git add . && git commit -m "chore: starter kit"

# 4. Start Claude Code
claude
```

Claude Code auto-loads `CLAUDE.md` on every session. That file is the project's constitution.

## Work order

Do slices in order. **Start a fresh Claude Code session for each slice** — context stays clean.

| # | Prompt | Deliverable |
|---|---|---|
| 1 | `slice-1-scaffold.md` | Empty monorepo + Next.js + i18n + Postgres + design tokens |
| 2 | `slice-2-calc.md` | `packages/calc` with full test coverage |
| 3 | `slice-3-types-and-api-client.md` | `packages/types` + `packages/api-client` (contracts + typed fetcher) |
| 4 | `slice-4-db-seed.md` | Prisma schema + bilingual sample seed (100 Pokémon) |
| 5 | `slice-5-quick-search.md` | **First working feature** — Quick Search, end-to-end, bilingual input |
| 6 | `slice-6-team-list-detail.md` | Team list + detail (read-only) |
| 7 | `slice-7-team-create.md` | Team creation with password |
| 8 | `slice-8-team-edit-delete.md` | Edit / delete flow (password verify) |
| 9 | `slice-9-comments-likes.md` | Comments + likes |
| 10 | `slice-10-crawler.md` | Bulbapedia + PokeAPI crawler (full master data) |
| 11 | `slice-11-pwa.md` | PWA manifest + install flow |

## How to use a slice prompt

Open the slice file, copy its contents, paste into Claude Code. File references like `@docs/spec.md` are resolved automatically.

## If requirements change mid-build

1. Update the relevant file in `docs/` first (the source of truth).
2. Then tell Claude Code "apply the change in docs/X to the code."

`CLAUDE.md` and `docs/` always lead; code follows.

## Prerequisites

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- Docker (for local Postgres)
- Claude Code installed
