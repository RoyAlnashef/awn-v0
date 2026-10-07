# References for Capacitor Phase 2 Push

## Old App (UX / pattern reference only)

The old app lives at `_misc/awn-old/`. It registered native tokens but never implemented server-side send — use it for UX patterns, not as a drop-in copy.

### Native push bridge

- **Location:** `_misc/awn-old/src/components/HomeApp.tsx` (or equivalent app shell)
- **Relevance:** Auto-register flow on native mount — permission request, `PushNotifications.register()`, `registration` listener posting token to API, `pushNotificationActionPerformed` for tap handling
- **Adapt for v0:** Replace tab-based navigation with Next.js `router.push(data.url)`; mount from `app/(app)/layout.tsx` instead of monolithic HomeApp

### Web push service worker

- **Location:** `_misc/awn-old/public/sw.js`
- **Relevance:** `push` event handler (show notification) and `notificationclick` handler (open URL)
- **Adapt for v0:** Enforce relative URLs only; align payload shape with `{ title, body, url, tag }`

### Push API routes (old app)

- **Location:** `_misc/awn-old/src/app/api/push/register-token/route.ts` — native token upsert pattern
- **Location:** `_misc/awn-old/src/app/api/push/send/route.ts` — internal secret auth for dispatch
- **Relevance:** Upsert by `endpoint` (token or Push API URL); webhook auth via `x-internal-secret`

### Database schema (old app)

- **Location:** `_misc/awn-old/supabase/migrations/20260425_push_subscriptions.sql`
- **Relevance:** `push_subscriptions` table shape — adapt RLS for awn-v0 `profiles` FK and service-role dispatch reads

---

## awn-v0 Targets

### App shell (mount native push provider)

- **Location:** [app/(app)/layout.tsx](../../../app/(app)/layout.tsx)
- **Relevance:** Authenticated layout — add `NativePushProvider` here for auto-register on native

### Root layout (optional web push SW registration)

- **Location:** [app/layout.tsx](../../../app/layout.tsx)
- **Relevance:** Register service worker for browser VAPID push

### Settings — Enable push button

- **Location:** [components/settings/notifications-settings-section.tsx](../../../components/settings/notifications-settings-section.tsx)
- **Relevance:** Wire "Enable push" — native vs browser context, show enabled/disabled state

### Notification creation (dispatch source)

- **Location:** [lib/notifications/actions.ts](../../../lib/notifications/actions.ts)
- **Relevance:** `createNotification` — optional `after()` dispatch fallback; webhook covers DB-trigger path

### Notification URL mapping

- **Location:** [lib/notifications-data.ts](../../../lib/notifications-data.ts)
- **Relevance:** Deep-link URL construction from notification `kind` + `data` jsonb

### API auth pattern

- **Location:** [app/api/presence/offline/route.ts](../../../app/api/presence/offline/route.ts)
- **Relevance:** Cookie session auth pattern for user-facing push registration routes

---

## Phase 1 Capacitor Spec

- **Location:** [agent-os/specs/2026-09-21-1110-capacitor-phase-1/](../2026-09-21-1110-capacitor-phase-1/)
- **Relevance:** Native shell, remote URL mode, `@capacitor/push-notifications` config already in [capacitor.config.ts](../../../capacitor.config.ts)

---

## Firebase Config Files

- **Original source (archival):** [agent-os/product/misc/GoogleService-Info.plist](../../product/misc/GoogleService-Info.plist)
- **Wired iOS copy:** [ios/App/App/GoogleService-Info.plist](../../../ios/App/App/GoogleService-Info.plist) — project `awrightnetwork`, bundle `com.awrightworld.awn.app`
- **Android copy:** [android/app/google-services.json](../../../android/app/google-services.json) — gitignored, same Firebase project
