# Nvidia — Prescriptor

A Next.js web application with Supabase backend, providing a prescriptor/recommendation interface. The app uses the App Router pattern with authentication flows and a dashboard area.

## Tech Stack

- **Framework:** Next.js (App Router, TypeScript)
- **Auth & Database:** Supabase (`@supabase/ssr`, `@supabase/supabase-js`)
- **UI:** React, Lucide React icons, `class-variance-authority`, `clsx`
- **Date handling:** `date-fns`
- **Forms:** React Hook Form + Zod resolvers
- **Styling:** (Tailwind CSS assumed via PostCSS config)
- **Deployment:** Vercel (`vercel.json` present)

## Setup

```bash
cd prescriptor-app
npm install
```

Copy `.env.local.example` to `.env.local` (if present) and set Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Build / Run / Test

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint
npm run lint
```

## Project Structure

```
Nvidia---Prescriptor/
└── prescriptor-app/          # All source code lives here
    ├── src/
    │   ├── app/
    │   │   ├── (auth)/       # Auth route group (login, signup, etc.)
    │   │   ├── (dashboard)/  # Protected dashboard routes
    │   │   ├── api/          # API route handlers
    │   │   ├── auth/         # Auth callback/confirmation routes
    │   │   └── layout.tsx    # Root layout
    │   ├── components/       # Reusable UI components
    │   ├── lib/              # Utility functions, Supabase client
    │   └── types/            # TypeScript type definitions
    ├── supabase-schema.sql   # Database schema for Supabase
    ├── package.json
    └── next.config.ts
```

## Architecture & Key Files

- `src/app/(auth)/` — Sign-in, sign-up, and password reset pages.
- `src/app/(dashboard)/` — Main app UI behind authentication.
- `src/app/api/` — Server-side API routes.
- `src/lib/` — Supabase client initialization and shared utilities.
- `supabase-schema.sql` — Run against your Supabase project to set up tables.
- `proxy.ts` — Likely a proxy layer for external API calls.

## Conventions & Notes for Agents

- All application code is inside `prescriptor-app/`; the repo root is just a wrapper.
- Uses Next.js App Router — pages are `page.tsx`, layouts are `layout.tsx`.
- Supabase SSR helpers (`@supabase/ssr`) are used for server-side auth; do not use the legacy `@supabase/auth-helpers-nextjs`.
- Environment variables `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are required at runtime.
- The `supabase-schema.sql` must be applied to the Supabase project before the app functions correctly.
