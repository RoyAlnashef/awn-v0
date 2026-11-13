# Capacitor Phase 1 — Shaping Notes

## Scope

Wire up Capacitor 7 in awn-v0 as a branded native shell that loads `https://awn-v0.vercel.app/` via remote URL mode. This covers package installation, config creation, and fresh native project generation for both iOS and Android. No custom native code or push notification bridge — that is Phase 2.

## Decisions

- **Fresh native projects** — `npx cap add ios` + `npx cap add android` rather than copying `ios/` and `android/` from awn-old. Cleaner slate.
- **`@capacitor/splash-screen` included** — the old app's config referenced it but the package was missing; including it now to match config.
- **`webDir: 'out'`** — placeholder required by Capacitor CLI for project generation; never actually used because remote URL mode skips web asset syncing.
- **`scrollEnabled: true` on iOS** — re-enabled so document scroll works; the old `false` setting blocked all scrolling because the web app relies on body scroll. Double-scroll is prevented via web-side `overscroll-contain` on nested scroll regions and `overflow-hidden` on fill-viewport shells.
- **`contentInset: 'always'` on iOS** — preserves safe area inset handling.

## Context

- **Visuals:** None — this is infrastructure, not UI
- **References:** `_misc/awn-old/capacitor.config.ts` — studied and used as the basis for v0 config
- **Product alignment:** Tech stack doc already lists Capacitor as the mobile deployment strategy

## Standards Applied

None — standards index is currently empty.
