# Smoke Check — People Directory Supabase

Run after applying migration in Supabase SQL Editor.

## Find People Page

- [ ] Page shows real active profiles (not 12 mock names)
- [ ] Grid view renders avatars, roles, locations, availability, skills
- [ ] List view renders same data in row layout
- [ ] Department filter works against real `department` values
- [ ] Credits/vouches/years stats reflect DB counts
- [ ] Connect button persists connection state across refresh
- [ ] Empty state appears when filters match nothing

## Profile Drawer

- [ ] Clicking a card opens drawer with real bio, tour credits, skills
- [ ] Connect/Follow button works and persists
- [ ] Message button navigates to DM thread

## Share Card

- [ ] Share card in DM thread shows full member data
- [ ] Share card click opens drawer with real profile
- [ ] Compose preview shows member attachment before send

## Messages / Rooms

- [ ] Message thread header profile drawer loads real data
- [ ] Room message author profile drawer loads real data
- [ ] `?person=` deep link opens real profile drawer

## Account

- [ ] Department saves on profile and appears on own card in directory
- [ ] Tour credits load from DB on account tour-credits page

## Cleanup

- [ ] No console errors referencing missing mock person IDs
- [ ] Grep for `people.find` and mock `people[]` returns zero hits
