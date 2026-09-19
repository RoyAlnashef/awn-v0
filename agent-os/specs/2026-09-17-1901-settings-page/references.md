# References for Settings Page

## Similar Implementations

### Account pill navigation

- **Location:** `components/account/account-nav.tsx`
- **Relevance:** Primary pattern for horizontal pill sub-nav with mobile NativeSelect fallback
- **Key patterns:** `Button variant={active ? "secondary" : "outline"}`, `render={<Link href={href} />}`

### My Jobs layout shell

- **Location:** `components/jobs/my-jobs-layout-shell.tsx`, `components/jobs/my-jobs-nav.tsx`
- **Relevance:** Route-based settings hub mirrors My Jobs structure
- **Key patterns:** PageShell + nav + content gap-4

### Account settings placeholder (prior)

- **Location:** `components/account/account-settings-section.tsx` (removed; moved to `components/settings/`)
- **Relevance:** SettingsRow layout, section grouping, danger zone styling
- **Key patterns:** Icon row, Separator between items, destructive bordered card

### User dropdown

- **Location:** `components/nav-user.tsx`
- **Relevance:** Settings link placement; quick toggles remain here only
- **Key patterns:** Link list with lucide icons

### Notification kinds

- **Location:** `lib/notifications-data.ts`, DB triggers for `dm_message`, `room_mention`, `room_reply`, etc.
- **Relevance:** Informs Notifications sub-page toggle groups and Coming soon badges

### Board view toggle

- **Location:** `components/board-view-toggle.tsx`, `hooks/use-board-view-mode.ts`
- **Relevance:** Preferences sub-page default view controls
