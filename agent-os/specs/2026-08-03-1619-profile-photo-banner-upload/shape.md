# Profile Photo & Banner Upload — Shaping Notes

## Scope

Add the ability for a member to:
1. Upload and crop/position a square avatar photo
2. Upload and reposition a banner photo (Notion-style drag-to-reposition)

Both photos are displayed in the preview card in real-time. This spec covers front-end only — data lives in draft state, no database persistence yet.

## Decisions

- **Front-end only:** Images stored as object URLs in draft state (`AccountProfileProvider`). No upload to Supabase Storage in this spec.
- **Avatar crop library:** Use `react-easy-crop` — lightweight, React-native, circular crop shape support, produces `croppedAreaPixels` used with HTML Canvas to export a blob.
- **Banner repositioning:** Pure pointer-event drag on the image itself (no library), adjusting CSS `object-position-y` as a percentage (0–100%). Same UX as Notion page covers.
- **Data model:** Add `banner?: string` and `bannerPositionY?: number` to `Person` interface (front-end draft only for now).
- **Photos section placement:** New section at the top of `ProfileSection`, above "Basic Info". Contains the banner editor stacked above the avatar editor, mirroring the visual layout of the card.
- **Preview card:** The `PersonProfileCard` hero is updated to show banner + position. Avatar already reads from `person.avatar`.

## Context

- **Visuals:** Screenshots of My Account page (form + preview card), Notion banner positioning UX
- **References:** Existing `AvatarUploadField` in `components/users/avatar-upload-field.tsx` for upload patterns; `PersonProfileCard` hero area for rendering target
- **Product alignment:** Supports My Account UX phase before database persistence of People

## Standards Applied

N/A — no active standards defined in this project yet.
