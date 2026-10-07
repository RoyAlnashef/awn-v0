# References for Message thread block and report

## Similar Implementations

### ConversationActionsDropdown

- **Location:** `components/messages/conversation-actions-dropdown.tsx`
- **Relevance:** Ellipsis trigger and dropdown menu styling for inbox rows
- **Key patterns:** `EllipsisVertical`, ghost icon button, `DropdownMenuContent align="end"`

### PersonProfileInteractiveFooter

- **Location:** `components/people/person-profile-interactive-footer.tsx`
- **Relevance:** Report form fields, block AlertDialog copy, `getMemberModerationState`, `blockMember`, `submitMemberReport`
- **Key patterns:** Reason select, moderation state, block confirmation text

### NavUser

- **Location:** `components/nav-user.tsx`
- **Relevance:** Mobile drawer vs desktop split with `useIsMobile`
- **Key patterns:** `Drawer` with `showSwipeHandle`, `swipeDirection="down"`

### MessageThread

- **Location:** `components/messages/message-thread.tsx`
- **Relevance:** Header layout, `messagingBlocked` composer, inbox SWR mutate
