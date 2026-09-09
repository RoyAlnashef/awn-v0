# Admin Emails — Branding Audit

All 10 email templates use `lib/email/templates/base.ts`:

- Dark background `#0a0a0b`, card `#141416`, border `#27272a`
- Header: "A Wright Network" (uppercase tracking)
- Purple CTA button `#7c3aed`
- Footer tagline: "Touring crew, connected."

## Resend (app)

| Template | File |
| -------- | ---- |
| Member invite | `lib/email/templates/invite-email.ts` |
| Application received | `lib/email/templates/application-confirmation.ts` |
| Application approved | `lib/email/templates/application-approved.ts` |
| Application denied | `lib/email/templates/application-denied.ts` |

## Supabase (auth)

| Template | TS source | Local HTML |
| -------- | --------- | ---------- |
| Magic link | `supabase/magic-link.ts` | `supabase/templates/magic-link.html` |
| Password recovery | `supabase/recovery.ts` | `supabase/templates/recovery.html` |
| Confirm signup | `supabase/confirmation.ts` | `supabase/templates/confirmation.html` |
| Invite user | `supabase/invite-user.ts` | `supabase/templates/invite.html` |
| Email change | `supabase/email-change.ts` | `supabase/templates/email-change.html` |
| Reauthentication | `supabase/reauthentication.ts` | `supabase/templates/reauthentication.html` |

Paste Supabase HTML from **Admin → Emails → Templates** into the Supabase Dashboard
(Authentication → Email Templates) for hosted projects. Local dev uses `config.toml` paths above.
