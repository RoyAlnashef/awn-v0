---
name: My Account Page
overview: Build the My Account page at `/account` as a multi-section hub with a full-width profile header and a two-column layout (left nav + right content). All content uses placeholder data — no database changes yet.
todos:
  - id: layout
    content: Create app/(app)/account/layout.tsx with AccountHeader + two-column shell (AccountNav left, children right), redirect page.tsx → /account/profile
    status: completed
  - id: header
    content: "Build components/account/account-header.tsx: banner, avatar, name/badges, stat chips"
    status: completed
  - id: nav
    content: "Build components/account/account-nav.tsx: vertical link list with active-state highlight via usePathname"
    status: completed
  - id: profile
    content: "Build profile/page.tsx + components/account/profile-section.tsx: basic info, availability, skills — placeholder form"
    status: completed
  - id: credits
    content: "Build tour-credits/page.tsx + components/account/tour-credits-section.tsx: credit card list with Add placeholder"
    status: completed
  - id: jobs
    content: "Build jobs/page.tsx + components/account/jobs-section.tsx: Tabs for Created / Saved with placeholder cards"
    status: completed
  - id: network
    content: "Build network/page.tsx + components/account/network-section.tsx: following grid with placeholder unfollow"
    status: completed
  - id: social
    content: "Build social/page.tsx + components/account/social-section.tsx: social link input rows"
    status: completed
  - id: account-settings
    content: "Build settings/page.tsx + components/account/account-settings-section.tsx: email, password, 2FA placeholder rows"
    status: completed
isProject: false
---

# My Account Page — UI Build Plan

## Architecture

The `/account` route gets its own nested layout (`account/layout.tsx`) that renders a profile header and the two-column shell. Sub-routes render their content into the right column.

```
app/(app)/account/
├── layout.tsx           ← AccountLayout: header + 2-col shell
├── page.tsx             ← redirect → /account/profile
├── profile/page.tsx
├── tour-credits/page.tsx
├── jobs/page.tsx
├── network/page.tsx
├── social/page.tsx
└── settings/page.tsx

components/account/
├── account-header.tsx   ← avatar, name, role, stat chips
├── account-nav.tsx      ← left vertical nav (links to sub-routes)
├── profile-section.tsx
├── tour-credits-section.tsx
├── jobs-section.tsx
├── network-section.tsx
├── social-section.tsx
└── account-settings-section.tsx
```

## Page Layout (Dribbble-inspired)

```
┌─────────────────────────────────────────────────────┐
│  PageShell: "My Account"                            │
│  ┌───────────────────────────────────────────────┐  │
│  │  AccountHeader: avatar · name · role · stats  │  │
│  └───────────────────────────────────────────────┘  │
│  ┌────────────┬──────────────────────────────────┐  │
│  │ AccountNav │  Sub-page content                │  │
│  │  Profile   │  (placeholder cards/forms)       │  │
│  │  Credits   │                                  │  │
│  │  Jobs      │                                  │  │
│  │  Network   │                                  │  │
│  │  Social    │                                  │  │
│  │  Settings  │                                  │  │
│  └────────────┴──────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## Sub-page groupings

| Nav item         | Route                   | Content                                                                                                           |
| ---------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Profile**      | `/account/profile`      | Avatar, name, title, role, bio, home base, city, company, availability, work auth, venue tiers, years exp, skills |
| **Tour Credits** | `/account/tour-credits` | Editable list of tour credits (artist, role, venue tier, years)                                                   |
| **Jobs**         | `/account/jobs`         | Two tabs: "Created" (jobs the member posted) + "Saved" (bookmarked jobs)                                          |
| **Network**      | `/account/network`      | Members they follow, with unfollow action                                                                         |
| **Social**       | `/account/social`       | Website URL, Instagram, LinkedIn, Twitter/X, other links                                                          |
| **Settings**     | `/account/settings`     | Email, password, 2FA toggle, appearance preferences                                                               |

## Placeholder data

Reuse the existing `Person` + `PersonProfile` types from `lib/people-data.ts` and `SessionUser` from `lib/auth/get-session-user.ts`. Hardcode a single mock member object inside each section component — no props drilling, no API calls yet.

## Key component details

**`account/layout.tsx`**

- Wraps with `PageShell title="My Account"`
- Renders `<AccountHeader />` above the two-column grid
- `grid grid-cols-[200px_1fr] gap-8` below the header

**`account-nav.tsx`**

- `"use client"` — uses `usePathname()` to highlight active link
- Vertical list of `<Link>` items styled like Dribbble's sidebar (simple text links, active = foreground + left indicator)

**`account-header.tsx`**

- Full-width banner (muted bg) with overlapping avatar (ring, large)
- Name, verified badge, founding badge
- Stat row: tour credits count · vouches · following count · member since
- Matches visual language of `PersonProfileDrawer` hero

**`profile-section.tsx`**

- Two-column form grid: left = labels, right = placeholder inputs (disabled/read-only for now)
- Sections: Basic Info, Availability & Auth, Skills

**`tour-credits-section.tsx`**

- Reuses the credit card style from `PersonProfileDrawer` (left accent bar, title, role, venue tier badge)
- "Add credit" button placeholder

**`jobs-section.tsx`**

- `Tabs` (shadcn) with "Created" and "Saved" tabs
- Placeholder job cards in each tab

**`network-section.tsx`**

- Grid of person mini-cards (avatar, name, role) with "Unfollow" button placeholder

**`social-section.tsx`**

- Labelled input rows for each social platform with icon

**`account-settings-section.tsx`**

- Email row, password row, 2FA toggle — all read-only placeholder
