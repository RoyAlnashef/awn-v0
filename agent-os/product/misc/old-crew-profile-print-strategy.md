# (Old AWN app) Crew Profile Print Formatting — Review Notes

Analysis of how `/crew/[handle]` (the "Touring Passport") is formatted for printing and saving as PDF in the current AWN app.

**Primary source files:**

- `src/app/crew/[handle]/page.tsx`
- `src/app/crew/[handle]/PrintButton.tsx`
- `src/features/profile/components/ProfileTab.tsx` (Touring Passport share link)

---

## The Core Strategy: Parallel Markup + `@media print`

Rather than restyling the same DOM for print, the crew page maintains **two parallel document structures**:

| Screen (visible)      | Print (hidden until print)          |
| --------------------- | ----------------------------------- |
| Full-bleed hero photo | Compact header with circular avatar |
| Dark theme, card UI   | White paper, resume typography      |
| Skill chips           | Sidebar skill list                  |
| 2-column credit cards | 3-column credit table               |
| Timeline work history | Flat work history rows              |
| Link buttons          | Full URLs as text                   |
| Apply CTA             | AWN footer + passport URL           |

Screen elements are hidden with `.no-print`, `.hero-photo`, `.cta-section`, and `.screen-body`. Print elements (`.print-header`, `.print-2col-body`, `.print-footer`) live in the DOM with `display: none` and are revealed inside `@media print`.

The trigger is a floating **"Save as PDF"** button that calls `window.print()` via a small client component (`PrintButton.tsx`). This matches the browser print dialog flow — the page looks like a designed document even with browser "Background graphics" turned off, because the print layout is **page content**, not browser chrome.

---

## Print Layout Design (Resume / "Touring Passport")

The print view is deliberately modeled as a **one-page professional CV**:

- **Page setup:** A4 portrait, 14mm top/bottom and 16mm left/right margins
- **"Nuclear reset":** Forces white background, dark text, removes shadows; uses `print-color-adjust: exact` to preserve brand accent color where re-applied
- **Hide screen UI:** Hero, CTA, and entire screen body are removed from print output

### Structure

**Header**

- Avatar (or initials fallback)
- Name + verified checkmark
- Role · location
- Availability status
- AWN wordmark (right-aligned)

**Left sidebar (~175px)**

- Skills (list with dividers)
- Links (Reel / Website with full URLs)
- Touring Passport URL (`awrightnetwork.com/crew/{handle}`)

**Main column**

- Bio (italic, paragraph-aware via shared `BioText` component)
- Tour Credits (3-column grid: artist | role | year)
- Work History (artist, role · type, year)

**Footer**

- Profile URL (left)
- `awn. A Wright Network · By invitation only` (right)

### Typography & color

- **Cormorant Garamond** for names and artist names
- **Inter** for metadata and body copy
- **#B84A26** accent for section labels, years, and AWN branding

### Shared logic (good patterns to preserve)

- `BioText` — splits bio on `\n\n` or single `\n` into paragraphs
- `fmtCreditYear()` — normalizes year display to compact ranges like `2021–23`, handling both combined strings (`2021-2023`) and separate `year_start` / `year_end` fields

---

## "Touring Passport" Product Concept

The print/PDF output is tied to the **Touring Passport** — a public, no-login profile page members can share with employers or productions. Members copy the link from their profile settings (`ProfileTab.tsx`):

> "A public page you can share with any employer or production — no login required."

The print layout reinforces this: sidebar and footer both include the passport URL, and the footer carries AWN branding plus "By invitation only."

---

## Things to Consider When Rebuilding

### 1. Duplicate markup will drift

Screen and print are separate trees fed by the same Supabase data. Any new profile field must be wired in **two places** or it will silently disappear from one view.

Currently omitted from print (but present in profile data / screen UI):

- `company`, `representing`
- `work_auth`, `has_passport`, `union_member`
- Tier badges on credits
- `available_from` date pill
- Work history notes

### 2. No pagination strategy

There are no `page-break-*` rules anywhere. Profiles with long bios, many credits, and full work history can break awkwardly across pages — rows can split mid-entry, and the custom footer is not a running footer (it won't repeat on page 2).

### 3. Browser print is the only PDF path

There is no server-side PDF generation (Puppeteer, `@react-pdf/renderer`, etc.). Output quality varies by browser, and users may need "Background graphics" enabled in some cases for accent colors — even though `print-color-adjust: exact` is set.

### 4. Font loading risk

Print styles load Google Fonts via `@import` inside an inline `<style>` block. Fonts may not render consistently in print preview if they haven't loaded yet. For a rebuild: self-host fonts or embed print-safe fallbacks.

### 5. The "nuclear reset" is fragile

The broad `color: #111 !important` reset on all elements, then selective overrides on print classes, is brittle. Inline accent colors (e.g. availability dot color, work history type labels) get wiped unless re-declared with `!important` in print CSS. Expect subtle visual regressions when adding new styled elements.

### 6. Hardcoded domain

Print footer and sidebar hardcode `awrightnetwork.com/crew/{handle}` instead of using `metadataBase` or dynamic origin. This breaks on preview/staging domains.

### 7. Avatar dependency

Print uses the remote `avatar_url` image. If the image host blocks print, is slow, or has CORS issues, the header may show a broken image. Initials fallback exists only when `avatar_url` is null.

### 8. Content hierarchy differs from screen

On screen, **Tour Credits** are visually emphasized (card grid, first credit highlighted in ember). In print, credits and work history are treated more equally as tabular lists. Work history also loses timeline visuals, type badge styling, and notes.

Decide explicitly: should print mirror screen priority, or stay resume-minimal?

### 9. Credits vs. work history data model

Two sources feed similar-looking content:

- `profile.credits` — JSON on profile, curated highlights
- `work_history` table — detailed timeline with role types and notes

Print shows both. Consider whether print should deduplicate or clearly distinguish "highlight credits" vs. "full history."

### 10. Architecture / maintainability

All screen + print CSS + markup live in one ~530-line server component with inline styles. For the next iteration, consider:

- A dedicated `PrintProfile` component
- A separate `/crew/[handle]/print` route
- Extracted print stylesheet (CSS module or dedicated `.css` file)
- Server-generated PDF for consistent output across browsers

### 11. `.page-inner` constrains print width

The shared `.page-inner { max-width: 820px }` rule still applies in print, so the layout won't use full paper width. This may be intentional (readable line length), but worth deciding explicitly for A4/Letter.

---

## Summary

The current approach is a **deliberate "Touring Passport" print experience**: browser-native PDF via `window.print()`, with a completely separate resume-style layout hidden behind `@media print`.

It works well for the one-page case (e.g. Aubrey Wright's profile), but the next iteration should address:

1. **Maintainability** — dual markup and inline styles in one large component
2. **Multi-page behavior** — page breaks and running footer
3. **Font/image reliability** — self-hosted fonts, avatar fallbacks
4. **Field parity** — screen vs. print content alignment
5. **Environment correctness** — dynamic domain instead of hardcoded URL

---

## Possible v2 Architecture Options

| Approach                                   | Pros                                                  | Cons                                                   |
| ------------------------------------------ | ----------------------------------------------------- | ------------------------------------------------------ |
| **Keep dual markup, extract components**   | Minimal migration; same UX                            | Still two trees to maintain                            |
| **Dedicated `/print` route**               | Cleaner separation; can optimize layout independently | Extra route; share data-fetching logic                 |
| **Server-generated PDF**                   | Consistent output; no browser variance                | Infra cost; harder to iterate on design                |
| **Single DOM + `@media print` transforms** | One source of truth                                   | Harder for radically different layouts (hero → header) |

Given how different screen and print layouts are today, a **dedicated print component or route** with shared data hooks and shared formatters (`BioText`, `fmtCreditYear`) is likely the most practical path forward.
