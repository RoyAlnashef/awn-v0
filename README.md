# AWN

AWN is a private, invite-only professional network for touring live entertainment crew — tour managers, engineers, techs, lighting and video teams, and the many roles that keep a tour running.

It gives working crew a trusted place to signal availability, fill urgent callouts, share road knowledge, and build peer-verified credits. Crew stay free forever; employers pay for access to the network.

This repo is the Next.js rebuild of AWN, focused on a modular codebase and a scalable design system.

## Tech stack

- [Next.js 16](https://nextjs.org/) (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- [shadcn/ui](https://ui.shadcn.com/)

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) 9+

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd awn-v0

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the Next.js dev server (Turbopack) |
| `pnpm build` | Create a production build |
| `pnpm start` | Run the production server |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run TypeScript without emitting files |
| `pnpm format` | Format TypeScript files with Prettier |
