# iOS Push Notifications — End-to-End Fix (Xcode Debug First)

Implementation spec. Shaping notes: [shape.md](./shape.md). Ops: [ops-checklist.md](./ops-checklist.md). Production follow-up: [production-apns.md](./production-apns.md).

Extends [Phase 2 push](../2026-09-21-1225-capacitor-phase-2-push/plan.md).

## Summary

Fix native APNs token forwarding (AppDelegate), harden token registration against auth timing, document Vercel sandbox APNs + Supabase INSERT/UPDATE webhooks, and verify on physical iPhone (Xcode debug).

## Code changes

1. **AppDelegate** — Capacitor push registration callbacks
2. **use-native-push.ts** — Session-aware token retry + re-register from settings

## Ops (dashboard)

See [ops-checklist.md](./ops-checklist.md).

## Verification

See device smoke section in [ops-checklist.md](./ops-checklist.md) and Phase 2 [smoke-test.md](../2026-09-21-1225-capacitor-phase-2-push/smoke-test.md#ios-e2e-fix-xcode-debug).
