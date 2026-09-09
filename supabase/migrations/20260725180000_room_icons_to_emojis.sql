-- =============================================================================
-- Migration: room_icons_to_emojis
--
-- IMPORTANT: Run this manually in the Supabase SQL Editor.
-- Agents must NEVER execute this against the project (no db push, no MCP SQL).
-- Paste the full contents of this file into the Dashboard → SQL Editor → Run.
-- =============================================================================

update public.community_rooms
set icon = case icon
  when 'hash' then '#'
  when 'music' then '🎵'
  when 'hand-helping' then '🤝'
  when 'speaker' then '🔊'
  when 'guitar' then '🎸'
  when 'life-buoy' then '🛟'
  when 'lightbulb' then '💡'
  when 'brain' then '🧠'
  when 'baby' then '👶'
  when 'camera' then '📷'
  when 'clipboard-list' then '📋'
  when 'truck' then '🚛'
  when 'route' then '🗺️'
  when 'sparkles' then '✨'
  else icon
end
where icon in (
  'hash',
  'music',
  'hand-helping',
  'speaker',
  'guitar',
  'life-buoy',
  'lightbulb',
  'brain',
  'baby',
  'camera',
  'clipboard-list',
  'truck',
  'route',
  'sparkles'
);

alter table public.community_rooms
  alter column icon set default '💬';

comment on column public.community_rooms.icon is
  'Emoji displayed beside the room name in lists and thread headers.';
