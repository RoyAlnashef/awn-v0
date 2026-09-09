# Profile Photo & Banner Upload — My Account

## Context

- **Profile form:** `components/account/profile-section.tsx` — left column, uses `useAccountProfile()` draft state
- **Preview card:** `components/people/person-profile-card.tsx` — right column, reads `person.avatar` and renders `<div className="h-24 bg-muted" />` for the hero (no banner today)
- **Draft state:** `components/account/account-profile-provider.tsx` — `Person` in React state, `updateDraft(patch)` to update
- **Person type:** `lib/people-data.ts` — `avatar?: string` already exists; `banner` and `bannerPositionY` do not

## Architecture

```
ProfileSection
└── Photos section
    ├── BannerUploadEditor → updateDraft({ banner, bannerPositionY })
    └── AvatarUploadEditor → updateDraft({ avatar })

Draft state (AccountProfileProvider)
└── PersonProfileCard (preview)
    └── Hero: banner img with object-position + avatar
```

## New Components

### `components/account/avatar-upload-editor.tsx`

- Circular avatar preview with a camera/upload overlay button
- Clicking triggers a hidden `<input type="file" accept="image/*">`
- On file select: opens a `<Dialog>` containing `<Cropper>` from `react-easy-crop`
  - `aspect={1}`, `cropShape="round"`, zoom slider
- "Apply" button: uses an HTML Canvas `drawImage` to produce a cropped `Blob` → `URL.createObjectURL` → calls `updateDraft({ avatar: url })`
- "Remove" button clears the avatar

### `components/account/banner-upload-editor.tsx`

- Compact banner preview area (matches the `h-24` in the card)
- Shows placeholder or current banner image
- "Upload banner" / "Change" button → hidden `<input type="file" accept="image/*">`
- After image loads: enters **reposition mode** — image shown with a drag handle; pointer drag adjusts `positionY` (0–100%)
- "Save position" → `updateDraft({ banner: url, bannerPositionY: y })`
- "Remove" button clears banner

## Modified Files

- `lib/people-data.ts` — Add `banner?: string` and `bannerPositionY?: number` to the `Person` interface
- `components/account/profile-section.tsx` — Add a "Photos" section (new `<section>`) at the top of the form, above Basic Info, containing `<BannerUploadEditor>` and `<AvatarUploadEditor>`
- `components/people/person-profile-card.tsx` — Replace the static `<div className="h-24 bg-muted" />` with a conditional: if `person.banner` is set, render an `<img>` with `object-fit: cover`, `height: 96px`, and `object-position: center ${person.bannerPositionY ?? 50}%`; otherwise fall back to the muted div

## Dependency

Install `react-easy-crop` — lightweight (~20 KB), no peer deps beyond React, used specifically for the avatar crop dialog.

## Todos

1. Save spec documentation
2. Install react-easy-crop
3. Extend Person type with banner fields
4. Build AvatarUploadEditor
5. Build BannerUploadEditor
6. Add Photos section to ProfileSection
7. Update PersonProfileCard hero
