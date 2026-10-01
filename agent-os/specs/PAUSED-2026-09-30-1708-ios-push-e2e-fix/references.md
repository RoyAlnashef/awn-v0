# References for iOS Push E2E Fix

## Phase 2 push (baseline)

- **Spec:** [../2026-09-21-1225-capacitor-phase-2-push/plan.md](../2026-09-21-1225-capacitor-phase-2-push/plan.md)
- **Smoke test:** [../2026-09-21-1225-capacitor-phase-2-push/smoke-test.md](../2026-09-21-1225-capacitor-phase-2-push/smoke-test.md)

## Client

- **Location:** `lib/push/use-native-push.ts`
- **Relevance:** Permission, register, token POST, deep link on tap
- **Mount:** `components/push/push-provider.tsx` in `app/(app)/layout.tsx`

## Server

- **APNs send:** `lib/push/send-apns.ts` — sandbox via `APNS_USE_SANDBOX=true`
- **Dispatch:** `app/api/push/dispatch/route.ts`
- **DM source:** `supabase/migrations/20260912180000_dm_message_notifications.sql` (INSERT + UPDATE)

## Capacitor

- **Package README:** `node_modules/@capacitor/push-notifications/README.md` — AppDelegate requirements

## Native iOS

- **AppDelegate:** `ios/App/App/AppDelegate.swift`
- **Entitlements:** `ios/App/App/App.entitlements` (`aps-environment` = development for debug)
