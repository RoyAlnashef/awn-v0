# iOS Push E2E Fix — Shaping Notes

## Scope

End-to-end iOS push for **Xcode debug** builds first: native APNs token delivery → `push_subscriptions` → server dispatch → sandbox APNs. Extends [Capacitor Phase 2 push](../2026-09-21-1225-capacitor-phase-2-push/plan.md); does not expand Android/web unless shared fixes apply.

## Decisions

- Fix **AppDelegate** Capacitor push callbacks (root cause for missing device tokens).
- Harden **session timing** on `POST /api/push/register-token` with retry + auth subscription.
- **Remote URL mode** unchanged — Vercel production env must use `APNS_USE_SANDBOX=true` for debug builds.
- Supabase **INSERT + UPDATE** webhooks on `notifications` required for DM aggregated pushes.
- TestFlight/production APNs documented as follow-up (Task 8).

## Context

- **Visuals:** None
- **References:** Phase 2 spec, `lib/push/use-native-push.ts`, `send-apns.ts`, Capacitor push README
- **Product alignment:** Off-app delivery for DMs and alerts (see `agent-os/product/mission.md`)

## Ops checklist (Xcode debug)

| Variable | Value for debug |
| -------- | ---------------- |
| `APNS_KEY_ID`, `APNS_TEAM_ID`, `APNS_KEY` | Valid Apple `.p8` key |
| `APNS_BUNDLE_ID` | `com.awrightworld.awn` |
| **`APNS_USE_SANDBOX`** | **`true`** |
| `INTERNAL_API_SECRET` | Webhook + dispatch auth |
| `SUPABASE_SERVICE_ROLE_KEY` | Dispatch reads subscriptions |

## Standards Applied

See [standards.md](./standards.md) — same patterns as Phase 2 push.
