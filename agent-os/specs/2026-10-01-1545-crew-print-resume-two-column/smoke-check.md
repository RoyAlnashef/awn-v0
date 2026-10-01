# Smoke check — crew print resume two-column layout

Quick verification after layout change (extends public crew profiles print checks).

## Print layout (no uploaded resume)

- [ ] Logged out: open `/crew/{handle}` for a member without `resume_url`
- [ ] **Save as PDF** / print → preview shows **left sidebar** (Skills, Links, Profile URL) and **right column** (bio, Credits)
- [ ] Header has **no avatar**; name, subtitle, availability, AWN mark remain
- [ ] No QR code in body; footer still shows profile URL
- [ ] Screen profile (dark/marketing layout) hidden in print preview

## Auto-print URL

- [ ] `/crew/{handle}?print=resume` opens print dialog (~400ms delay via `CrewAutoPrint`)

## Edge cases

- [ ] Member with no social links → **Links** section omitted
- [ ] Member with no credits → right column shows bio only (if present)

## Unchanged behavior

- [ ] Member **with** uploaded resume → **Resume** still downloads via `/api/crew/[handle]/resume` (not print layout)
