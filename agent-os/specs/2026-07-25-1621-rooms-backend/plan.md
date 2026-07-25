# Rooms — Backend Wiring Plan

## Scope

Wire the existing polished Rooms UI to a real Supabase backend: DB schema, server actions, SWR hooks, Supabase realtime, live nav badge, and a functional Admin Groups management page.

**In scope**

- DB migration: `community_rooms`, `room_memberships`, `room_messages`, `room_message_reactions` tables + RLS + RPCs + auto-join trigger + 14 seeded rooms
- Server actions: `lib/rooms/actions.ts`
- SWR hooks: `lib/rooms/hooks/`
- Wire `RoomsProvider` and `RoomThread` to real data
- Live nav badge via `useRoomsUnreadCount`
- Admin `/groups` page: room management table, create/edit/archive

**Out of scope**

- Room activity on the Now tab (Now tab is a placeholder shell)
- Push notifications for room messages
- Onboarding department auto-join (onboarding flow not yet built)
- Appear offline toggle

## Tasks

1. Save spec documentation (this folder)
2. DB migration: tables, RLS, RPCs, trigger, seed 14 rooms
3. Server actions: `lib/rooms/actions.ts`
4. Hooks: `lib/rooms/hooks/`
5. Wire RoomsProvider + RoomThread to real data; add RoomsRealtimeBridge
6. Wire nav badge from static `"2"` to live `useRoomsUnreadCount`
7. Build out `/groups` admin page

## Key Design Decisions

| Decision | Choice |
|---|---|
| Data pattern | Mirror DM layer — `lib/rooms/` parallel to `lib/messages/` |
| Messages UI parity | Reuse same bubble/composer/reactions/scroller components; no parallel implementations |
| Auto-join | DB trigger on `profiles.status → 'active'` fires for all `is_default` rooms |
| Admin management | `/groups` admin page with list/create/edit/archive |
| Realtime | Supabase postgres_changes on room_messages INSERT |
| Room visibility | All authenticated users can read rooms/messages (semi-public preview) |
