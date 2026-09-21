# Capacitor Phase 2 — Shaping Notes

## Scope

Implement dual-path push notification delivery for AWN v0:

1. **Native Capacitor push** — iOS via APNs HTTP/2, Android via FCM (`firebase-admin`)
2. **Browser VAPID web push** — service worker + `web-push` on the server

Phase 1 wired the native shell and `@capacitor/push-notifications` config. Phase 2 adds token/subscription storage, registration API routes, server-side dispatch, client bridges, and settings UX. In-app notifications (Supabase `notifications` table + Realtime UI) already work; push is the missing delivery channel.

## Decisions

- **Dual-path, single table** — `push_subscriptions` stores web and native tokens; dispatch branches on `subscription.type` / `subscription.platform`
- **Single dispatch entry point** — Supabase webhook on `notifications` INSERT → `POST /api/push/dispatch`; optional `after()` fallback from `createNotification`
- **Event source = in-app notification row** — push payload mirrors `{ title, body, url }`; no duplicate business logic for message content
- **Respect viewing/mute at dispatch** — skip push when recipient is actively viewing the conversation/room or has muted the room
- **Channel toggle only in Phase 2** — "Enable push" in settings; per-kind category toggles remain "coming soon"
- **Deep links = Next.js paths** — `/messages?conversation=…`, `/messages?room=…` (not old app `?tab=` nav)
- **Remote URL mode unchanged** — native app loads production; push routes must be deployed before end-to-end device testing
- **Build fresh in awn-v0 conventions** — old app (`_misc/awn-old`) is UX/reference only, not copied wholesale

## Product Alignment

- **Mobile deployment strategy** — push completes the Capacitor mobile story started in Phase 1 ([Phase 1 spec](../2026-09-21-1110-capacitor-phase-1/plan.md))
- **Existing notification center** — push extends delivery; in-app Realtime UI unchanged
- **Settings page** — wire existing "Enable push" affordance in [notifications-settings-section.tsx](../../../components/settings/notifications-settings-section.tsx)
- **UX patterns from old app** — auto-register on native app mount; explicit opt-in via settings for browser

## Credentials Status

| Credential                    | Status  | Location / action needed                                      |
| ----------------------------- | ------- | ------------------------------------------------------------- |
| `google-services.json`        | ✅ Done | `android/app/google-services.json` (gitignored)               |
| `GoogleService-Info.plist`    | ✅ Done | `ios/App/App/GoogleService-Info.plist` (needs Xcode target)   |
| APNs auth key (`.p8`)         | Pending | UT-2 — env: `APNS_KEY_ID`, `APNS_TEAM_ID`, `APNS_KEY`         |
| Firebase service account JSON | Pending | UT-3 — env: `FIREBASE_SERVICE_ACCOUNT_JSON`                   |
| VAPID key pair                | Pending | UT-4 — env: `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` |
| Xcode Push capability         | Partial | UT-5 — Push Notifications + Background Modes in Xcode         |
| Supabase webhook              | Pending | UT-6 — `notifications` INSERT → `/api/push/dispatch`          |
| Deploy + device test          | Pending | UT-7 — Vercel env vars + physical device verification         |

## Standards Applied

See [standards.md](./standards.md). The agent-os standards index is currently empty; follow existing awn-v0 patterns.
