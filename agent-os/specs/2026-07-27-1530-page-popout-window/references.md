# References for Page Pop-out Window

## Similar Implementations

### MessagesView / RoomsView

- **Location:** `components/messages/messages-view.tsx`, `components/rooms/rooms-view.tsx`
- **Relevance:** Primary views reused in popout pages; mobile layout via `md:` breakpoints at 768px
- **Key patterns:** Single-column inbox/thread toggle, back button in thread header (`md:hidden`), page title hidden when thread open

### Header flyouts

- **Location:** `components/messages.tsx`, `components/rooms.tsx`
- **Relevance:** Sheet-based quick access to inbox; popout is the full-page mobile equivalent in a separate window
- **Key patterns:** Deep-link navigation via search params

### App layout

- **Location:** `app/(app)/layout.tsx`
- **Relevance:** Auth guard + provider wiring; popout layout mirrors providers but omits sidebar/header

### Mobile breakpoint hook

- **Location:** `hooks/use-mobile.ts`
- **Relevance:** `MOBILE_BREAKPOINT = 768`; popout window width (~390px) stays below this threshold
