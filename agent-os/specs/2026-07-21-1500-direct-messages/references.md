# References for Direct Messages

## Similar Implementations

### MessagesProvider

- **Location:** `components/messages/messages-provider.tsx`
- **Relevance:** Shared conversation/unread state for flyout + full page
- **Key patterns:** `markConversationRead`, `startConversation`, `bumpConversation`, activity ordering

### Header Messages flyout

- **Location:** `components/messages.tsx`
- **Relevance:** Live unread badge, navigate to `?conversation=` deep link
- **Key patterns:** Controlled Sheet, `useMessages()`, mark read on select

### MessagesView split-pane

- **Location:** `components/messages/messages-view.tsx`
- **Relevance:** Inbox + thread orchestration, mobile back
- **Key patterns:** `initialConversationId` deep link via useEffect

### MessageThread chat UI

- **Location:** `components/messages/message-thread.tsx`
- **Relevance:** Transcript, composer, read receipts
- **Key patterns:** MessageScroller, Bubble, InputGroup

### RoomsProvider (mirror pattern)

- **Location:** `components/rooms/rooms-provider.tsx`
- **Relevance:** Provider shape for shared nav badge + page state

### Completed flyout plan

- **Location:** `.cursor/plans/messages_flyout_navigation_ae4eae1c.plan.md`
- **Relevance:** Documents flyout → page navigation already implemented

### Auth / Supabase

- **Location:** `lib/auth/get-session-user.ts`, `lib/supabase/server.ts`
- **Relevance:** Session user for bubble alignment and server action auth

### Person profile drawer

- **Location:** `components/people/person-profile-drawer.tsx`
- **Relevance:** Message CTA entry point
