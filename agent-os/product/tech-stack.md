# Tech Stack

## Frontend

- **Next.js 16** (App Router) — primary framework
- **React 19** — UI layer
- **TypeScript 5** — strict typing
- **Tailwind CSS 4** — styling
- **shadcn/ui** — component system (v0.dev for early layout/UX)
- **Lucide React** — icons
- **Framer Motion** — animations and transitions (as needed)
- **Mapbox GL** — interactive On The Road / check-in map
- **next-themes** — theme support

## Backend

- **Next.js API Routes** — serverless route handlers
- **Supabase** — Postgres with Row Level Security, Auth (password + magic link/OTP), Realtime, Storage (avatars, covers, resumes)
- **Resend** — transactional and marketing email
- **Stripe** — employer subscription billing (checkout + webhooks)
- **Web Push (VAPID)** — browser push notifications
- **Google Places API** — venue and vendor search for Road Intel / Atlas

## Database

- **PostgreSQL via Supabase** — primary datastore
- Schema and migrations informed by the previous AWN app (profiles, invites, jobs, help_now, check-ins, communities/messaging, intel/venues, credit endorsements, billing-related tables, etc.)

## Mobile

- **PWA** — installable web experience
- **Capacitor** — iOS and Android native shells loading the production web app

## Hosting & Infrastructure

- **Vercel** — hosting, serverless functions, Edge Network, Analytics
- **Vercel Cron Jobs** — scheduled tasks (onboarding emails, digests, availability nudges)

## Architecture & Quality Goals

- Modular feature boundaries (avoid monolith page files)
- Clear coding standards and industry best practices for long-term scale
- Type-safe data access and enforceable RLS for trust/privacy
- Component-driven UI via shadcn, consistent with the design system built during layout/UX work
