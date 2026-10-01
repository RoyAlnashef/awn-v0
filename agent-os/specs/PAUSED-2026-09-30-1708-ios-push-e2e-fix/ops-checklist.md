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

Server code **retries the alternate APNs host** once only on `BadEnvironmentKeyInToken`. Log messages show both attempts, e.g. `BadEnvironmentKeyInToken (api.sandbox…) → BadDeviceToken (api.push…)`.

If **`total` is 2** but you expect one device, list all rows for that user and remove stale web/iOS duplicates before testing.

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

## iOS safe-area (cold start)

Requires a **production deploy** of the web app (native shell loads `https://awrightnetwork.com`).

Top inset is **viewport-compensated** (`resolveIosHeaderInsetTop`): 34px when the webview origin is shifted up (cold launch), 0px on relaunch when origin is 0. Bottom stays 34px.

1. Delete app → reinstall from Xcode → **first open** (before dismissing push prompt): site header clears status bar / Dynamic Island (no overlap with time or icons).
2. Allow or deny notifications → header inset unchanged (no jump under status bar).
3. Web Inspector console (initial login and **2nd login** after force-quit):

```javascript
const header = document.querySelector('[data-slot="site-header"]');
const row = header?.querySelector(":scope > div");
console.log({
  headerTop: header?.getBoundingClientRect().top,
  rowTop: row?.getBoundingClientRect().top,
  headerPaddingTop: header && getComputedStyle(header).paddingTop,
  htmlInset: getComputedStyle(document.documentElement).getPropertyValue(
    "--site-header-inset-top",
  ),
});
```

Expect **`rowTop` ~0–2px** on both loads; initial: `headerPaddingTop` 34px, `headerTop` ~−34; 2nd: `headerPaddingTop` 0px (or unset), `headerTop` 0.

4. Background app → foreground → inset still correct.
5. Force-quit → **second open** → layout still correct (no double gap).
6. Rotate once → header/sheets respect inset without overlap.

## Device smoke (physical iPhone)

1. Delete app → reinstall from Xcode → login → allow notifications → Settings shows **Push enabled**.
2. Confirm SQL row above for your user.
3. Force-quit app → trigger job notification (`createNotification` path) → push received.
4. Force-quit → one new DM after marking thread read → push received (INSERT webhook).
5. Send 2–3 DMs without opening thread → pushes on updates (UPDATE webhook).
6. Tap notification → correct in-app route.

## TestFlight / production (follow-up)

See [production-apns.md](./production-apns.md).
