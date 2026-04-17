# Slice 11 — PWA + mobile-ready polish

## Goal

App is installable on home screen. Offline-capable for read paths. Final polish before potential native app work.

## Prompt to send to Claude Code

```
Read @CLAUDE.md, @docs/design.md, @docs/architecture.md.

Turn the web app into an installable PWA and apply final polish.

## 1. Manifest

apps/web/public/manifest.webmanifest

```json
{
  "name": "PokeSearch",
  "short_name": "PokeSearch",
  "description": "Share and explore competitive Pokémon teams",
  "start_url": "/en",
  "display": "standalone",
  "theme_color": "#1F1E1D",
  "background_color": "#FFFFFF",
  "orientation": "portrait",
  "icons": [
    { "src": "/icons/192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

Placeholder pokeball-style icons in apps/web/public/icons/ — SVG-to-PNG generated. Note in README they should be replaced with a designer's work before launch.

Link from layout.tsx metadata.

## 2. Service worker

Install `serwist` (modern SW library, works with App Router).

Cache strategy:
- Static (JS, CSS, fonts, sprites): CacheFirst, 30-day expiry
- /api/search, /api/pokemons/*: StaleWhileRevalidate, 5-min max age
- /api/teams/*, /api/comments/*, /api/likes/*: NetworkOnly (always fresh)

Precache the `/en` and `/ko` home routes so offline opens don't show a blank page.

## 3. Install CTA

apps/web/components/InstallPrompt.tsx (client):
- Listens for `beforeinstallprompt`
- Renders a dismissible banner on home (small, top of viewport)
- "Install as app" / "Dismiss" buttons
- Dismissal stored in localStorage; hide for 7 days

For iOS Safari (no beforeinstallprompt):
- Detect iOS user agent
- Show different banner explaining "Tap Share → Add to Home Screen"

Keep this opt-in: user can tap X to hide; don't nag.

## 4. Mobile meta

apps/web/app/[locale]/layout.tsx metadata:

```ts
export const metadata = {
  title: 'PokeSearch',
  description: '...',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'PokeSearch',
    statusBarStyle: 'default',
  },
  formatDetection: { telephone: false },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#1F1E1D',
};
```

## 5. Performance polish

- Audit with Lighthouse on `/en`, `/en/search`, `/en/teams/{id}`
- Targets: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90, PWA all green
- Optimize images (Pokémon sprites loaded from jsdelivr — add `loading="lazy"` to list thumbnails)
- Defer non-critical scripts

## 6. Error boundaries

apps/web/app/[locale]/error.tsx — client component, shows friendly localized message + retry button.
apps/web/app/[locale]/not-found.tsx — "Page not found" with home link.

## 7. Review for mobile app readiness

Walk through the codebase and confirm:
- [ ] No business logic inside React components (check components/, app/)
- [ ] Every API call goes through `packages/api-client`
- [ ] Every API contract defined as Zod schema in `packages/types`
- [ ] No platform-specific imports in `packages/*` (no `next/*` imports, no `document`, no `window`)
- [ ] Design tokens listed in `docs/design.md` ready for extraction to a shared package when mobile starts

Fix any violations found.

## 8. Documentation update

Update root README.md:
- Deployment notes (Vercel / Fly.io / etc.)
- Env vars list with descriptions
- How to run locally end-to-end
- Link to CLAUDE.md and docs/ for contributors

## 9. Launch checklist (add to README.md)

- [ ] HTTPS configured (production)
- [ ] Error monitoring wired up (Sentry recommended)
- [ ] Privacy policy page (mention bcrypt + IP hashing for likes)
- [ ] Terms of use (no-login service caveats)
- [ ] No real-person imagery audit
- [ ] PokeAPI CDN fallback if jsdelivr down (Cloudflare Images or self-host later)
- [ ] Bulbapedia / PokeAPI attribution in footer or About page
- [ ] crawl.yml workflow enabled

## Verification

- Lighthouse PWA audit all green on Chrome DevTools
- Service worker visible in Application tab
- Offline mode: reload a previously visited team detail, content appears
- Install prompt appears on Chrome Android
- iOS Safari shows the "Add to Home Screen" banner correctly
- All E2E tests from previous slices still pass (regression)

## Out of scope

- Actual native mobile app (separate future project under apps/mobile)
- Payment / subscription (no monetization in v1)
```

## After this slice

v1 is done. To start mobile app:
1. Create `apps/mobile/` with Expo
2. Import `@pokesearch/api-client`, `@pokesearch/calc`, `@pokesearch/types`
3. Build React Native screens matching the design tokens
4. Share backend (API routes). No API changes needed.
