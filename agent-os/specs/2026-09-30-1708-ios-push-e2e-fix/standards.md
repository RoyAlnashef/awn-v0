# Standards for iOS Push E2E Fix

The agent-os standards index ([agent-os/standards/index.yml](../../standards/index.yml)) is empty. Follow Phase 2 push conventions.

---

## Code organization

- Native iOS changes in `ios/App/App/AppDelegate.swift` only for token forwarding.
- Client registration logic stays in `lib/push/use-native-push.ts`.
- No duplicate dispatch logic; reuse `lib/push/dispatch.ts` and existing API routes.

---

## Auth patterns

- **register-token** — Supabase session via cookie or Bearer ([lib/push/require-api-user.ts](../../../lib/push/require-api-user.ts)).
- **dispatch** — `x-internal-secret` header matching `INTERNAL_API_SECRET`.

---

## Native Capacitor

- Required AppDelegate methods per `@capacitor/push-notifications` README.
- Rebuild iOS app after native changes; physical device for push tests.

---

## Documentation

- Ops steps that cannot live in git (Vercel env, Supabase webhooks) documented in [ops-checklist.md](./ops-checklist.md).
