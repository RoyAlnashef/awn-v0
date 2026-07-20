# Minimal Auth Slice — Notes

## Scope

- `/login` with email/password and magic link
- `/auth/callback` for magic-link PKCE exchange
- Middleware gates all non-public routes
- Header **Log out** → `signOut` → `/login`
- Nav user loaded from `profiles` + auth session

## Deferred

- Forgot password UI
- Approval / pending gate
- Onboarding, apply, waitlist
- Public signup
