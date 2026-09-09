# Member Share to Messages — Shaping Notes

## Scope

Allow members to share a crew profile to an existing DM conversation only (no rooms/communities). The Share CTA opens a searchable destination picker limited to active DM conversations. Selecting a destination navigates to Messages with the member pre-attached in the composer; sending posts a rich member card embed.

## Decisions

- **Destinations:** DM conversations only — no Communities/rooms section in picker
- **Select behavior:** Navigate to compose — open thread with member pre-attached; user taps Send
- **Message format:** Rich member card embed in the message bubble (optional text note alongside)
- **Surfaces:** `PersonCard`, `PersonRow`, `PersonProfileDrawer` (all three, matching job share)
- **Data model:** `shared_profile_id uuid` FK on `dm_messages` → `profiles(id)`; join at read time
- **Mutual exclusivity:** A message may attach a job **or** a member, not both (enforced at app layer)
- **Deferred:** Rooms sharing, Web Share API, new DM from picker, denormalized snapshot storage, message search indexing

## Context

- **Visuals:** Member card grid + profile drawer Share button in `visuals/`
- **References:** Job share implementation in `agent-os/specs/2026-07-28-1640-job-share-to-messages/` and `components/jobs/job-share-*.tsx`
- **Product alignment:** P1 People + Messages — members recommend crew to contacts in DMs
- **Prerequisite:** People mock `Person.id` values must align to real profile UUIDs before end-to-end share works in dev

## Standards Applied

- `css/shadcn-ui` — Popover, Input, Avatar, Attachment primitives
- `css/design-tokens` — semantic tokens, `font-heading` for name emphasis
- `global/board-pattern` — consistent Share wiring on card, row, and detail drawer
