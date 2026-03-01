---
trigger: always_on
---

# Healthcare AI Coding Standards (Supabase-First)

## Architecture & Backend
- **Framework**: Next.js 15 (App Router).
- **Backend Stack**: Supabase (Auth, Postgres, Storage, Realtime).
- **ORM**: Drizzle ORM (configured for Postgres).
- **Data Pattern**: Use **Next.js Server Actions** for all mutations. Use **Server Components** for initial reads.
- **Security**: MANDATORY Row Level Security (RLS) on all tables.
- **Validation**: Every Server Action MUST use a Zod schema.

## Authentication
- Use `@supabase/ssr` for server-side auth.
- Always retrieve user via `supabase.auth.getUser()` on the server to prevent session spoofing.
- Route protection must be handled in `middleware.ts`.

## UI & Aesthetics
- **CSS**: Tailwind CSS 4.
- **Animations**: Framer Motion (Transitions, Hover effects, Micro-interactions).
- **UI Components**: Shadcn UI / Radix UI.
- **Visual Style**: Premium Healthcare (Soft Teals, Glassmorphism, Rounded XL/2XL).
- **Icons**: Lucide React.

## Visual Language (Aesthetics)
- Rounded corners: `rounded-xl` or `rounded-2xl`.
- Padding: Use `p-6`, `p-8` for spacious containers.
- Glassmorphism: `backdrop-blur-md bg-white/10 dark:bg-black/10 border border-white/20`.
- Use **Lucide React** or **Tabler Icons**.

## Rules
- DO NOT create new API routes in `src/app/api` if a Server Action can be used instead.
- DO NOT add components to `src/components` if they are only used in a single feature.
- ALWAYS use `Zod` schemas in Server Actions.
- Ensure all forms use **React Hook Form** with Zod.
- Refer to `DEVELOPMENT_RULES.md` for more details.
- if new tables created or altered or need to insert data refer to the supabase_setup.sql and create new file updates.sql and add query to this file and next time remove this code and update new query in this so i can check and use and copy and paste this query to editor