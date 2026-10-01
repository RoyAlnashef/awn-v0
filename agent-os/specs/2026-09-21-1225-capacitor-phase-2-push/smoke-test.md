# Phase 2 Push — Smoke Test Checklist

## Code complete (implementation)

- [x] `push_subscriptions` migration written — `supabase/migrations/20260921124500_push_subscriptions.sql`
- [x] `push_subscriptions` **repair** migration — `supabase/migrations/20260921180000_push_subscriptions_repair.sql` (adds missing `subscription` jsonb column)
- [x] `push_subscriptions` **legacy column drop** — `supabase/migrations/20260921190000_push_subscriptions_drop_legacy_columns.sql` (fixes `p256dh` NOT NULL on Enable push)
- [x] Server dispatch layer — `lib/push/` (VAPID, FCM, APNs + failure logging)
- [x] API routes — `/api/push/{register-token,subscribe,unsubscribe,dispatch}`
- [x] Dispatch route skips read/deleted webhook events; supports aggregated UPDATE pushes
- [x] Native bridge — `PushProvider` in app layout, auto-register on mount
- [x] Web push — `public/sw.js`, Settings → Enable push (surfaces API errors, restores enabled state)
- [x] APNs sandbox support — `APNS_USE_SANDBOX=true` for Xcode debug builds
- [x] Dispatch hook — `createNotification()` uses `after()`; webhook route accepts Supabase INSERT/UPDATE payload
- [x] Android `POST_NOTIFICATIONS` permission in `AndroidManifest.xml`
- [x] iOS `UIBackgroundModes: remote-notification` in `Info.plist`
- [x] `GoogleService-Info.plist` added to Xcode project (`project.pbxproj` → Copy Bundle Resources)
- [x] `npx cap sync` — `CapacitorPushNotifications` pod present

## Prerequisites (user)

- [x] `android/app/google-services.json` in place (gitignored)
- [x] `ios/App/App/GoogleService-Info.plist` on disk and in Xcode target
- [ ] Run **repair** migration in Supabase SQL Editor (`20260921180000_push_subscriptions_repair.sql`) — required if Enable push returns 500 missing `subscription` column
- [ ] Run **legacy column drop** in Supabase SQL Editor (`20260921190000_push_subscriptions_drop_legacy_columns.sql`) — required if Enable push returns 500 `null value in column "p256dh"`
- [x] Run base migration in Supabase SQL Editor (`20260921124500_push_subscriptions.sql`) if table did not exist
- [x] Xcode: Push Notifications capability + Background Modes → Remote notifications (Signing & Capabilities)
- [x] Env vars in Vercel/local `.env`:
  - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_EMAIL`
  - `FIREBASE_SERVICE_ACCOUNT_JSON`
  - `APNS_KEY_ID`, `APNS_TEAM_ID`, `APNS_KEY`, `APNS_BUNDLE_ID`
  - `APNS_USE_SANDBOX=true` while testing Xcode debug builds; `false` for TestFlight/App Store
  - `INTERNAL_API_SECRET`
  - `SUPABASE_SERVICE_ROLE_KEY`
- [x] Supabase webhook: `notifications` **INSERT** → `POST https://awrightnetwork.com/api/push/dispatch` with header `x-internal-secret: <INTERNAL_API_SECRET>`
- [ ] Supabase webhook: `notifications` **UPDATE** → same URL + header (for aggregated DM / room mention/reply pushes)
- [x] Deploy push routes to production (remote URL mode loads live site)

## Build checks

- [ ] Android Gradle build succeeds with `google-services.json`
- [x] iOS Xcode build succeeds with Push capability enabled

## iOS scroll checks

Requires web overscroll changes deployed to production **and** `scrollEnabled: true` synced via `npm run cap:sync` + Xcode rebuild.

- [ ] Now (or any PageShell page without fillViewport): scroll aggressively; page title (e.g. greeting) must not appear in the gap above SiteHeader
- [x] Jobs / People: page scrolls vertically
- [x] Messages / Groups: thread scrolls; inbox scrolls; page header stays fixed; no whole-page scroll while inside thread
- [x] Account / Job edit (fill-viewport): inner column scrolls without moving header
- [x] Auth / login: scrolls if content exceeds viewport

## Device checks

### Web push registration

1. Run repair + legacy column drop migrations in Supabase if not done
2. Chrome → Settings → Notifications → **Enable push** → grant permission
3. Network: `POST /api/push/subscribe` returns **200** `{ "ok": true }`
4. SQL: row in `push_subscriptions` with `subscription->>'type' = 'web'`

- [ ] Browser: Settings → Enable push → subscription row saved
- [ ] Browser: Disable push → subscription row removed

### Push delivery

**Clean test:** recipient opens thread (marks read), force-quits app / closes tab, sender sends one new DM.

- [ ] Send test DM → in-app notification + push on device (Chrome recipient)
- [ ] Send test DM → in-app notification + push on iOS (Xcode debug with `APNS_USE_SANDBOX=true`)
- [ ] 3 rapid DMs without opening thread → push on each message (requires UPDATE webhook)
- [ ] Tap push → deep link opens correct screen

## iOS E2E fix (Xcode debug)

Spec: [2026-09-30-1708-ios-push-e2e-fix](../2026-09-30-1708-ios-push-e2e-fix/plan.md) — AppDelegate token forwarding + registration retry.

### Code (this repo)

- [x] `AppDelegate.swift` — Capacitor `didRegister` / `didFailToRegister` callbacks
- [x] `use-native-push.ts` — session-aware token registration retry

### Ops (Vercel + Supabase)

See [ops-checklist.md](../2026-09-30-1708-ios-push-e2e-fix/ops-checklist.md).

- [ ] Vercel: `APNS_USE_SANDBOX=true` for Xcode debug testing
- [ ] Supabase: `notifications` **UPDATE** webhook (INSERT may already exist)

### Device verification (physical iPhone)

- [ ] Registration → `push_subscriptions` iOS row + Settings **Push enabled**
- [ ] Push via `createNotification` path (app force-quit)
- [ ] Push via DM INSERT webhook
- [ ] Push via DM UPDATE webhook (aggregated messages)
- [ ] Tap push → deep link
