# iOS Push E2E — Ops Checklist (Xcode Debug)

Complete these in Vercel and Supabase Dashboard. The native app loads production (`capacitor.config.ts` → `https://awrightnetwork.com`).

## Vercel environment

Confirm or set:

- `APNS_KEY_ID`
- `APNS_TEAM_ID`
- `APNS_KEY` (PEM content; `\n` escaped if single-line)
- `APNS_BUNDLE_ID=com.awrightworld.awn`
- **`APNS_USE_SANDBOX=true`** (required for Xcode debug device tokens)
- `INTERNAL_API_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`

Redeploy after changing env vars. **Env changes only apply to new deployments** — save the variable, then trigger a production redeploy.

`APNS_USE_SANDBOX` must be the string `true` (case-insensitive). After deploy, push failure logs include `apnsSandboxMode: true|false` in metadata.

### `BadEnvironmentKeyInToken` in admin logs

Apple returns this when the **device token environment** does not match the **APNs host**:

| Your build | Vercel `APNS_USE_SANDBOX` |
| ---------- | ------------------------- |
| Xcode **Debug** (development push entitlement) | `true` |
| TestFlight / App Store | `false` |

If the log still shows this error with `apnsSandboxMode: true`, the installed app may be using a **production** token (Release scheme, or production entitlement in the signed build). Try `false`, or rebuild with Debug + development entitlements.

Server code also **retries the alternate APNs host** once on `BadEnvironmentKeyInToken` / `BadDeviceToken` (deploy latest app code for this).

Verify token shape in Supabase: `endpoint` should be **64 hex characters** (32 bytes). Shorter values are invalid — delete the row and re-open the app after a native rebuild.

## Supabase Database Webhooks

Target: `POST https://awrightnetwork.com/api/push/dispatch`

Header: `x-internal-secret: <INTERNAL_API_SECRET>`

| Event  | Table            | Purpose                                      |
| ------ | ---------------- | -------------------------------------------- |
| INSERT | `notifications`  | First DM / new notification rows             |
| UPDATE | `notifications`  | Aggregated DMs, room mention/reply upserts   |

Payload: Supabase default webhook body with `record` fields (`id`, `user_id`, `kind`, `title`, `body`, `data`, `read`, `room_id`).

## Migrations

In Supabase SQL Editor, ensure applied (if register-token returns 500):

1. `supabase/migrations/20260921124500_push_subscriptions.sql`
2. `supabase/migrations/20260921180000_push_subscriptions_repair.sql`
3. `supabase/migrations/20260921190000_push_subscriptions_drop_legacy_columns.sql`

## Verify iOS tokens

```sql
select id, user_id, subscription->>'platform' as platform, left(endpoint, 16) as token_prefix, updated_at
from push_subscriptions
where subscription->>'platform' = 'ios'
order by updated_at desc
limit 10;
```

## Device smoke (physical iPhone)

1. Delete app → reinstall from Xcode → login → allow notifications → Settings shows **Push enabled**.
2. Confirm SQL row above for your user.
3. Force-quit app → trigger job notification (`createNotification` path) → push received.
4. Force-quit → one new DM after marking thread read → push received (INSERT webhook).
5. Send 2–3 DMs without opening thread → pushes on updates (UPDATE webhook).
6. Tap notification → correct in-app route.

## TestFlight / production (follow-up)

See [production-apns.md](./production-apns.md).
