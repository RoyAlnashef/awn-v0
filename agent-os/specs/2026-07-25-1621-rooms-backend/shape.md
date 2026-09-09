# Rooms Backend — Shaping Notes

## Scope

Wire the existing polished Rooms UI (rooms page, rooms-inbox, room-thread, rooms-provider, header sheet) to a real Supabase backend. The UI layer is complete as a mock prototype using `lib/messages-data.ts`. This work adds DB schema, server actions, SWR hooks, Supabase realtime, live nav badge, and a functional Admin Groups management page.

## Decisions

- **Data pattern:** Mirror the DM layer exactly — `lib/rooms/` parallel to `lib/messages/`; same actions → SWR hooks → realtime → provider pipeline
- **Messaging UI parity:** Room thread reuses the same components and interaction patterns as DMs (bubbles, composer, reactions, scroller, pagination, optimistic send)
- **RLS:** Rooms are semi-public — any authenticated user can read messages (enables preview for unjoined rooms); only members can send
- **Admin management:** Keep the `/groups` admin page; build it out with a room list table, create/edit/archive dialogs
- **Auto-join trigger:** DB-level trigger on `profiles.status` → `'active'` to auto-join default rooms; no app-layer wiring needed
- **Realtime:** Supabase postgres_changes on `room_messages INSERT`; no polling fallback

## Context

- **Visuals:** Screenshots from previous Rooms UI spec in `agent-os/specs/2026-07-20-1643-rooms-page/visuals/`
- **References:** `lib/messages/actions.ts`, `lib/messages/hooks/`, `dm_*` migration files, `components/rooms/` existing UI
- **Product alignment:** Rooms are P2 in the migration priority table; Messages (DM) backend is already done and serves as the reference

## Standards Applied

- `lib/rooms/` mirrors `lib/messages/` — consistent naming and file structure
- Server actions use `"use server"` + `requireUserId()` + `actionError()` pattern from `lib/messages/actions.ts`
- SWR hooks follow the same key/fetcher/options shape as `use-inbox.ts` and `use-thread.ts`
- Migration file follows existing convention: manual-only header + tables + RLS + RPCs + realtime publication
