# Slice 8 — Edit + delete team

## Goal

Team owner (anyone with the password) can edit or delete their team.

## Prompt to send to Claude Code

```
Read @CLAUDE.md, @docs/spec.md (screen 8), @docs/i18n.md, @docs/ui-components.md.

VISUAL TARGET: Open @docs/mockups/reference.html — screen 8 (delete modal) is the target. The edit password modal uses the same structure minus the danger block.

Notable references in ui-components.md:
- §16 Modal overlay pattern
- §17 Warning / danger blocks

Implement edit and delete flows with password verification.

## 1. APIs

POST /api/teams/:id/verify
  Body: { password: string }
  Returns { verifyToken: string } — signed JWT, 30 min expiry, payload { teamId, iat, exp }
  Error 401 on wrong password, with rate limiting:
  - Track failures per IP in an in-memory Map (Redis later)
  - After 5 consecutive failures: 429 with Retry-After header, lockout 15 min

PUT /api/teams/:id
  Header: Authorization: Bearer {verifyToken}
  Body: same as CreateTeamRequest but password optional (change only if present)
  Server verifies token (JWT library: jose) — rejects expired/invalid/wrong-teamId tokens
  Transaction: delete existing team_pokemons + moves, re-insert (simpler than diffing)

DELETE /api/teams/:id
  Header: Authorization: Bearer {verifyToken}
  Returns 204. Cascade deletes team_pokemons, moves, comments, likes.

## 2. JWT setup

- Install `jose`
- Secret from env `JWT_SECRET` (generate a 64-char random, add to .env.example as a placeholder)
- Helper: apps/web/lib/jwt.ts with signVerifyToken(teamId) and verifyToken(token)

## 3. Pages

apps/web/app/[locale]/teams/[id]/edit/page.tsx
  Client component — receives verifyToken from query string (short-lived) or session
  Uses the same TeamEditor from slice 7, pre-filled with existing team data
  "Save changes" button calls PUT /api/teams/:id

## 4. Components

apps/web/components/
├── PasswordConfirmModal.tsx   Single component used for both edit and delete intent
│                              Props: mode 'edit' | 'delete', onSuccess(token)
│                              On success, for 'edit' pushes to /teams/[id]/edit?t={token}
│                              For 'delete' calls DELETE API and navigates home on 204

Reused in team detail page — the existing Edit and Delete buttons open this modal.

## 5. Token transport

Security tradeoff: putting token in URL works but leaks into browser history / referers.

For v1: pass via `sessionStorage` + immediate use, not URL.
- On verify success, save `{teamId, token, exp}` to sessionStorage
- Edit page reads from sessionStorage. If missing or expired, re-opens password modal.
- Clear from sessionStorage after successful edit.

For mobile (future): use SecureStore (Expo) instead. api-client is already abstraction-friendly.

## 6. Error UX

- Wrong password: inline red text under input: "Password doesn't match"
- 5 failures: "Too many attempts. Try again in 15 minutes."
- Token expired during edit: modal re-opens automatically
- Network error during save: toast + retry button, preserve form state

## 7. E2E tests

apps/web/e2e/edit-delete-team.spec.ts
- Create team from slice 7 test
- Click edit → password modal → correct password → redirected to edit page → change name → save → detail shows new name
- Wrong password: error message, no navigation
- Delete flow: confirm → team disappears from home

## Acceptance

- Passwords always transmitted over HTTPS (verify in deployment)
- sessionStorage cleared on tab close (no persistent tokens)
- Rate limiter resets after 15 min
- All labels localized
- Dangerous-action colors applied (delete button red)

## Out of scope

- Comments / likes (next slice)
- Restore deleted team (not supported; v1 does hard delete)
```
