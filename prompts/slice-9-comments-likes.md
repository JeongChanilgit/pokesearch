# Slice 9 — Comments and likes

## Goal

Team detail gets interactive feedback: comments (password-deletable) and likes (dedup by fingerprint).

## Prompt to send to Claude Code

```
Read @CLAUDE.md, @docs/spec.md (screen 9), @docs/i18n.md, @docs/ui-components.md.

VISUAL TARGET: Open @docs/mockups/reference.html — screen 9 (Comments, KO locale) is the pixel target. Render the same layout in whichever locale the user is in.

Notable references in ui-components.md:
- §18 Like button (liked / not-liked states)
- §19 Comment item (nickname · relative time · delete button)
- §20 Comment composer (nickname + password + textarea + submit)

Implement comments and likes.

## 1. Comment APIs

POST /api/teams/:id/comments
  Body: { nickname, password, content }
  Validation: nickname 1-20, content 1-500, password 4-64
  Server bcrypt-hashes password
  Rate limit: same IP cannot post 2 comments within 60 seconds (in-memory Map)
  Forbidden-word filter: env FORBIDDEN_WORDS comma-separated, case-insensitive match on content
  Returns created comment (without password_hash)

GET /api/teams/:id/comments?page=N
  Newest first, 20 per page, returns { comments: [...], hasMore: boolean }

DELETE /api/comments/:id
  Body: { password }
  Server verifyPassword against stored hash. 204 on success, 401 on mismatch.

## 2. Like APIs

POST /api/teams/:id/likes
  No body.
  Compute client_fp = sha256(ip + user-agent)
  If already liked (UNIQUE constraint hit): 409 Conflict
  Otherwise insert + increment teams.likes_count in transaction, return 201

DELETE /api/teams/:id/likes
  Same client_fp calculation, remove row, decrement counter

GET /api/teams/:id/likes/me
  Returns { liked: boolean } based on current client_fp

## 3. Components

apps/web/components/
├── CommentList.tsx          Paginated list
├── CommentItem.tsx          Body + nickname + relative time + delete button
├── CommentForm.tsx          Compose form (nickname/password/content)
├── CommentDeleteConfirm.tsx Inline password prompt, no modal
└── LikeButton.tsx           Functional now. Toggles on tap, shows count.

## 4. Relative time

apps/web/lib/date.ts:
```ts
export function formatRelative(date: Date, locale: 'en' | 'ko'): string {
  // Use Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  // Thresholds: <60s "just now" / <60m "N minutes ago" / <24h "N hours ago" / <7d "N days ago" / else full date
}
```

Use in CommentItem to render "2 hours ago" / "2시간 전".

## 5. State management

Comments list: server-fetched on initial render, then client manages additions/deletions with optimistic updates using TanStack Query (install now).

Like state: server component hydrates with liked/count, client component wraps for optimistic toggle.

Install:
- pnpm --filter @pokesearch/web add @tanstack/react-query

Set up QueryClient provider in app/[locale]/layout.tsx.

## 6. Optimistic UI

- Post comment: add to list immediately, mark as "posting…" if slow, rollback on 4xx/5xx with toast
- Delete comment: remove immediately, restore on error
- Toggle like: flip state immediately, rollback on conflict

## 7. E2E tests

apps/web/e2e/comments-likes.spec.ts
- Post comment → appears at top with "just now"
- Try to post same-IP second comment within 60s → error toast
- Delete own comment with right password → gone
- Delete with wrong password → inline error
- Like → counter increments, refresh → still liked
- Unlike → counter decrements

## Acceptance

- Rate limit resets correctly after 60s
- Forbidden-word filter works (test with FORBIDDEN_WORDS="badword1,badword2" in test .env)
- Relative time localized (ko: "방금 전", en: "just now")
- client_fp handling: same user doesn't double-like even across reloads
- No password ever logged or sent to client

## Out of scope

- Comment edit (v1 is delete-then-repost)
- Nested replies (v1 is flat)
- Comment notifications (no user accounts)
```
