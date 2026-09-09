# Page Pop-out Window — Shaping Notes

## Scope

Let users pop Messages and Rooms into a mobile-sized browser window (~390×844) via a trigger on the right side of page headers. Popout pages must look and behave identically to current mobile screens — same components, breakpoints, and navigation — with only app chrome removed.

## Decisions

- **Mechanism:** `window.open()` same-origin browser window
- **Content:** Reuse `MessagesView` / `RoomsView` as-is; window width below 768px triggers existing mobile layout
- **Deep link:** Preserve `?conversation=` / `?room=` when a thread is active
- **Chrome:** Dedicated `(popout)` route group — no sidebar, no `SiteHeader`
- **popout prop:** Only hides the pop-out trigger inside the popout window; all other mobile UI unchanged

## Context

- **Visuals:** None (header placement reference from existing app screenshots)
- **References:** Messages/Rooms views, header flyouts (`components/messages.tsx`, `components/rooms.tsx`)
- **Product alignment:** Messaging is core crew communication; popout supports extended chat sessions on desktop

## Standards Applied

- page-shell — header/actions pattern for pop-out trigger placement
- shadcn-ui — Button + Tooltip for PopOutButton
