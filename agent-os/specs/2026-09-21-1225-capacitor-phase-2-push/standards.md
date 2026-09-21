# Standards for Capacitor Phase 2 Push

The agent-os standards index ([agent-os/standards/index.yml](../../standards/index.yml)) is currently empty. Follow existing awn-v0 conventions for all Phase 2 work.

---

## Code organization

- **Server push logic** — `lib/push/` modules (types, send per channel, dispatch orchestration, should-send filters)
- **API routes** — `app/api/push/` with thin route handlers delegating to `lib/push/`
- **Client hooks** — `lib/push/use-native-push.ts`, `lib/push/use-web-push.ts`
- **Client providers** — `components/push/` for mountable wrappers (e.g. `NativePushProvider`)
- **Database** — new migration in `supabase/migrations/` with RLS policies

---

## Auth patterns

- **User-facing routes** (`register-token`, `subscribe`, `unsubscribe`) — Supabase session via cookie or Bearer token; follow [app/api/presence/offline/route.ts](../../../app/api/presence/offline/route.ts)
- **Internal dispatch route** — `x-internal-secret` header matching `INTERNAL_API_SECRET` env var (Supabase webhook caller)

---

## Server actions & side effects

- Reuse [lib/notifications/actions.ts](../../../lib/notifications/actions.ts) `createNotification` as the notification source
- Optional dispatch trigger via Next.js `after()` for belt-and-suspenders until webhook is verified
- Do not duplicate notification content/business logic in push layer

---

## UI

- Wire [components/settings/notifications-settings-section.tsx](../../../components/settings/notifications-settings-section.tsx) using existing shadcn primitives from `@/components/ui/*`
- Compose with `cn()` from `@/lib/utils`; use semantic design tokens from `app/globals.css`
- Mount native push provider from [app/(app)/layout.tsx](../../../app/(app)/layout.tsx) (authenticated shell only)

---

## Deep links & data mapping

- Reuse URL mapping patterns from [lib/notifications-data.ts](../../../lib/notifications-data.ts) for push payload `url` field
- Enforce relative URLs in service worker click handlers (security)

---

## Secrets & config

- Document new env vars in `.env.example`; never commit `.p8`, service account JSON, or VAPID private key
- Firebase client config files (`google-services.json`, `GoogleService-Info.plist`) are client-side; server credentials stay in env

---

## Native platform

- Run `npx cap sync` after adding push plugin dependencies
- iOS: APNs tokens from Capacitor (not FCM); Android: FCM tokens
- Follow Phase 1 Capacitor config in [capacitor.config.ts](../../../capacitor.config.ts) — remote URL mode, app ID `com.awrightworld.awn`
