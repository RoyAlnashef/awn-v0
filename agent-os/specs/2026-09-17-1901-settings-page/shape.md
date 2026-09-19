# Settings Page — Shaping Notes

## Scope

Create a standalone Settings hub at `/settings/*`, separate from My Account (`/account/*`). My Account remains the public identity hub (Profile, Tour Credits, Connections, Social). Settings handles account mechanics, notifications, privacy, and display preferences.

This pass is **front-end only** — placeholder UI with no server actions or persistence.

## Decisions

- Remove Settings tab from My Account nav
- Settings entry points:
  - User dropdown (between My Jobs and Support)
  - My Account page header — icon button left of My Profile
- Four sub-pages: Account, Notifications, Privacy, Preferences
- Quick toggles (Available for work, Appear offline) stay in dropdown only
- Per-room mute remains in Messages room menu (info callout on Notifications page)

## Context

- **Visuals:** User-provided My Account and dropdown screenshots (session assets; not copied to repo)
- **References:** `account-nav.tsx`, `my-jobs-nav.tsx`, `account-settings-section.tsx` (prior), `nav-user.tsx`, notification kinds in `lib/notifications-data.ts`
- **Product alignment:** P2 Profile + settings and Notifications in `agent-os/product/misc/feature-migration-inventory.md` §3F

## Standards Applied

- `global/page-shell` — SettingsLayoutShell uses PageShell
- `css/shadcn-ui` — Button, Switch, Select, Badge, Alert from `@/components/ui/*`
- `css/design-tokens` — semantic tokens throughout
- `global/sidebar-nav` — nav item patterns (Settings is dropdown-only, not sidebar)
- `global/board-pattern` — board view segment controls mirror BoardViewToggle
