# Standards for Rooms Backend

## Server Actions Pattern

All server actions in `lib/rooms/actions.ts` follow the same conventions as `lib/messages/actions.ts`:

- Top-level `"use server"` directive
- `requireUserId()` helper for auth guard
- `actionError()` for uniform error shape
- Return types are discriminated unions: `{ ok: true; ... } | { ok: false; error: string }`
- Admin actions additionally call `requireAdmin()` from `lib/auth/require-admin.ts`

## SWR Hooks Pattern

All hooks in `lib/rooms/hooks/` follow the same conventions as `lib/messages/hooks/`:

- `"use client"` directive
- SWR key constants in `lib/rooms/swr-keys.ts`
- `dedupingInterval`, `revalidateOnFocus` settings consistent with DM hooks
- Hooks expose `isLoading` as `isLoading && !data` (not the SWR default)

## Realtime Pattern

`use-rooms-realtime.ts` mirrors `use-inbox-realtime.ts`:

- Single Supabase channel named `"rooms-global"`
- `postgres_changes` filter on `public.room_messages` INSERT
- Mutates SWR thread cache via `mutate` (no revalidate) to append new messages
- Mutates unread count key when message is from another user

## Migration Convention

Migration file follows the existing pattern in `supabase/migrations/`:

```
-- =============================================================================
-- Migration: create_room_tables
--
-- IMPORTANT: Run this manually in the Supabase SQL Editor.
-- Agents must NEVER execute this against the project (no db push, no MCP SQL).
-- =============================================================================
```

Tables use `uuid primary key default gen_random_uuid()`, FK references to `public.profiles(id) ON DELETE CASCADE`, and RLS enabled.

## Messaging UI Parity

Room thread must reuse, not reimpliment:
- `MessageBubbleWithReactions` from `components/messages/message-bubble-with-reactions.tsx`
- `MessageScroller*` primitives from `components/ui/message-scroller.tsx`
- `InputGroup*` composer from `components/ui/input-group.tsx`
- `formatMessageTime` / `formatRelativeTime` from `lib/messages/format.ts`
- `applyLocalReaction` from `lib/messages/reactions.ts`
