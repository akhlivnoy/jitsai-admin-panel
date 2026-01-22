# Jitsai Admin Panel

Minimal React/Vite admin panel for managing `techniques` via Supabase. Reads directly from the `techniques` table; all insert/update/delete actions are forwarded to a single admin-only Edge Function.

## Prerequisites

- Node 18+
- Yarn
- Supabase project with:
  - `techniques` table
  - `user_roles` table (role enum `public.user_role`, FK to `profiles.id`)
  - Edge Function (e.g., `techniques-admin`) that only allows admins and accepts `{ type: 'insert' | 'update' | 'remove', payload }`

## Setup

1. Install deps

```sh
yarn install
```

2. Create `.env.local`

```env
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

## Run

```sh
yarn dev
```

App runs at http://localhost:5173.

## Auth and roles

- Email/password sign-in using Supabase Auth.
- After session loads, the app queries `public.user_roles` for the current `user_id` and requires `role = 'admin'` to access the panel. Non-admins see an unauthorized screen.

## Data flow

- Reads: `select * from techniques order by created_at desc`.
- Mutations: call Edge Function `techniques-admin` with `{ type: 'insert'|'update'|'remove', payload }`. Ensure the function enforces admin-only access.

## Project structure

- `src/lib/supabaseClient.ts` – Supabase client
- `src/auth/AuthProvider.tsx` – session + roles context and admin check
- `src/features/techniques/` – fetch/mutation helpers and UI panel
