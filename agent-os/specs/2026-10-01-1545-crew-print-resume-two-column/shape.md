# Crew print resume two-column layout — Shaping Notes

## Scope

Restructure the browser print resume (`CrewResumeDocument`) so generated PDFs match the legacy two-column layout: left sidebar, right main content. Applies to `window.print()` and `?print=resume` only—not uploaded resume downloads.

## Decisions

- Left sidebar order: **Skills** → **Links** (social fields) → **Profile** (crew URL text only)
- Right column: bio, then **Credits** (not “Tour Credits”)
- Header: no avatar or initials placeholder
- Remove QR from print body; footer keeps profile URL
- Skills: stacked list with dividers (not pills)

## Context

- **Visuals:** `visuals/reference-legacy-print-layout.png`, `visuals/current-app-print-layout.png`
- **References:** `components/crew/crew-resume-document.tsx`, `lib/crew/build-resume-data.ts`, `lib/social-links.ts`, `agent-os/specs/2026-09-17-2008-public-crew-profiles/`
- **Product alignment:** Shareable crew profiles and printable career records (mission.md)

## Standards Applied

N/A — `agent-os/standards/index.yml` is empty.
