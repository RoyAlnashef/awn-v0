# Direct Messages — Shaping Notes

## Scope

Build AWN direct 1:1 messaging in two phases:

1. **Phase A (UI polish):** Wire live sidebar badge, URL sync on full page, profile → Message entry, read receipt UI prep
2. **Phase B (Backend):** Supabase schema, server actions, provider refactor, realtime, persisted read receipts

Direct messages only — community rooms remain on `/rooms`.

## Decisions

- UI-then-backend sequencing per user preference
- DMs-only boundary: skip Help Now→DM, push/email notifications, appear offline
- Reuse existing MessagesProvider + flyout + split-pane shell (already built with mock data)
- Fallback to mock inbox data when DB tables are not yet migrated (dev continuity)
- Voice/video call buttons remain inert placeholders

## Context

- **Visuals:** Messages page, New message drawer, header flyout, header icon badge (see `visuals/`)
- **References:** Messages/Rooms provider pattern, completed flyout navigation plan
- **Product alignment:** Direct messages slice of Phase 1 MVP; defers cross-feature notification wiring

## Standards Applied

- sidebar-nav — live Messages badge in sidebar
- page-shell — chat pages use full-height exception
- shadcn-ui — compose existing message/bubble/scroller primitives
- design-tokens — semantic Tailwind tokens, font-heading for titles
