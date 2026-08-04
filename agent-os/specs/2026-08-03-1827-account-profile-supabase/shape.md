# Account Profile — Supabase Wiring — Shaping Notes

## Scope

Wire the My Account **Profile** sub-page to Supabase so signed-in members can load and persist their real profile data. All Profile form fields persist: photos, basic info, availability window, venue tiers, work auth, and skills. Tour credits in the preview panel remain mock until the Tour Credits sub-page pass.

## Decisions

- **All Profile fields** in this pass; tour credits preview stays mock
- **Schema:** extend existing `public.profiles` (1:1 with `auth.users`)
- **Photos persist immediately** on upload (matches `/settings` avatar pattern); text/multi-select fields persist on Save
- **UX gate:** manual smoke checklist after implementation before Tour Credits pass
- **Migrations are manual-only** — paste into Supabase SQL Editor

## Context

- **Visuals:** `visuals/my-account-profile.png`
- **References:** avatar-actions, avatar-upload-field, get-session-user, require-profile-editor
- **Product alignment:** P2 Profile + settings in feature-migration-inventory; extends My Account hub with real backend

## Standards Applied

- global/page-shell — account layout uses PageShell
- css/design-tokens — semantic styling tokens
- css/shadcn-ui — form/button conventions
