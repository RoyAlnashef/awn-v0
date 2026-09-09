# References for Rooms Page

## Similar Implementations

### Messages page shell

- **Location:** `app/(app)/messages/page.tsx`
- **Relevance:** Full-height wrapper pattern for chat pages
- **Key patterns:** `h-[calc(100svh-4rem)] flex-col p-4 md:p-6`

### MessagesView split-pane orchestration

- **Location:** `components/messages/messages-view.tsx`
- **Relevance:** Left list / right thread / mobile back behavior
- **Key patterns:** State for active item, responsive hide/show columns, empty state

### MessageThread chat UI

- **Location:** `components/messages/message-thread.tsx`
- **Relevance:** Header, scroller, bubbles, composer
- **Key patterns:** `MessageScroller`, `Bubble`, `InputGroup`, local send state

### MessagesInbox room list (pre-refactor)

- **Location:** `components/messages/messages-inbox.tsx` (Rooms tab, lines 180–236)
- **Relevance:** Room row layout, join toggle, search filtering
- **Key patterns:** Icon tile, name/description, Join/Joined button

### Mock data layer

- **Location:** `lib/messages-data.ts`
- **Relevance:** `ThreadMessage`, `Room`, `getThread()`, `messageThreads` record
- **Key patterns:** Explicit thread records + preview fallback generator

### Sidebar nav config

- **Location:** `lib/nav.ts`, `components/app-sidebar.tsx`
- **Relevance:** Adding Rooms nav entry
- **Key patterns:** `mainNav` array, badge counts, icon imports
