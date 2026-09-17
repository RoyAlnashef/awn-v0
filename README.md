# A Wright Network - AWN

AWN is a private, invite-only professional network for touring live entertainment crew — tour managers, engineers, techs, lighting and video teams, and the many roles that keep a tour running.

It gives working crew a trusted place to signal availability, fill urgent callouts, share road knowledge, and build peer-verified credits. Crew stay free forever; employers pay for access to the network.

This repo is the Next.js rebuild of AWN, focused on a modular codebase and a scalable design system.

## Tech stack

- [Next.js 16](https://nextjs.org/) (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- [shadcn/ui](https://ui.shadcn.com/)
- [Supabase](https://supabase.com/) (Postgres, Auth, Realtime, Storage)

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) 9+
- [Supabase CLI](https://supabase.com/docs/guides/cli) (optional, for local DB / migrations)

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd awn-v0

# Install dependencies
pnpm install

# Copy env template and fill in Supabase keys
cp .env.example .env.local

# Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Supabase environment

Create `.env.local` from [`.env.example`](.env.example) and set:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable (anon) key for browser + SSR clients |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key — server-only, never expose to the client |

Clients live under `lib/supabase/`. Root `proxy.ts` refreshes auth sessions; it does not protect routes yet. Database schema and migrations are added separately as features are built.

The Supabase CLI in this repo is linked to the **AWN-v0** project. After cloning, run `supabase link --project-ref dpjsyhdzsragnatcxbic` if needed.

## Scripts

| Command          | Description                              |
| ---------------- | ---------------------------------------- |
| `pnpm dev`       | Start the Next.js dev server (Turbopack) |
| `pnpm build`     | Create a production build                |
| `pnpm start`     | Run the production server                |
| `pnpm lint`      | Run ESLint                               |
| `pnpm typecheck` | Run TypeScript without emitting files    |
| `pnpm format`    | Format TypeScript files with Prettier    |
