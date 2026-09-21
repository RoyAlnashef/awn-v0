# Phase 2 Push — Smoke Test Checklist

## Code complete (implementation)

- [x] `push_subscriptions` migration written — `supabase/migrations/20260921124500_push_subscriptions.sql`
- [x] Server dispatch layer — `lib/push/` (VAPID, FCM, APNs)
- [x] API routes — `/api/push/{register-token,subscribe,unsubscribe,dispatch}`
- [x] Native bridge — `PushProvider` in app layout, auto-register on mount
- [x] Web push — `public/sw.js`, Settings → Enable push
- [x] Dispatch hook — `createNotification()` uses `after()`; webhook route accepts Supabase INSERT payload
- [x] Android `POST_NOTIFICATIONS` permission in `AndroidManifest.xml`
- [x] iOS `UIBackgroundModes: remote-notification` in `Info.plist`
- [x] `GoogleService-Info.plist` added to Xcode project (`project.pbxproj` → Copy Bundle Resources)
- [x] `npx cap sync` — `CapacitorPushNotifications` pod present



## Prerequisites (user)

- [x] `android/app/google-services.json` in place (gitignored)
- [x] `ios/App/App/GoogleService-Info.plist` on disk and in Xcode target
- [x] Run migration in Supabase SQL Editor (`20260921124500_push_subscriptions.sql`)
- [x] Xcode: Push Notifications capability + Background Modes → Remote notifications (Signing & Capabilities)
- [x] Env vars in Vercel/local `.env`:
  - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_EMAIL`
  - `FIREBASE_SERVICE_ACCOUNT_JSON`
  - `APNS_KEY_ID`, `APNS_TEAM_ID`, `APNS_KEY`, `APNS_BUNDLE_ID`
  - `INTERNAL_API_SECRET`
- [x] Supabase webhook: `notifications` INSERT → `POST https://awrightnetwork.com/api/push/dispatch` with header `x-internal-secret: <INTERNAL_API_SECRET>`
- [x] Deploy push routes to production (remote URL mode loads live site)



## Build checks

- [ ] Android Gradle build succeeds with `google-services.json`
- [x] iOS Xcode build succeeds with Push capability enabled



## iOS scroll checks

Requires web overscroll changes deployed to production **and** `scrollEnabled: true` synced via `npm run cap:sync` + Xcode rebuild.

- [ ] Jobs / People: page scrolls vertically
- [ ] Messages / Groups: thread scrolls; inbox scrolls; page header stays fixed; no whole-page scroll while inside thread
- [ ] Account / Job edit (fill-viewport): inner column scrolls without moving header
- [ ] Auth / login: scrolls if content exceeds viewport

## Device checks

- [ ] Native app: permission prompt → token row in `push_subscriptions`
- [ ] Browser: Settings → Enable push → subscription row saved
- [ ] Send test DM → in-app notification + push on device
- [ ] Tap push → deep link opens correct screen
- [ ] Browser: Disable push → subscription row removed