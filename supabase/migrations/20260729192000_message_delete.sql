-- =============================================================================
-- Migration: message_delete
--
-- Adds RLS policies so senders can hard-delete their own messages.
-- Run manually in Supabase SQL Editor.
-- =============================================================================

create policy "dm_messages_delete_own"
  on public.dm_messages
  for delete
  to authenticated
  using (
    sender_id = auth.uid()
    and public.is_dm_participant(conversation_id)
  );

create policy "room_messages_delete_own"
  on public.room_messages
  for delete
  to authenticated
  using (
    sender_id = auth.uid()
    and public.is_room_member(room_id)
  );
