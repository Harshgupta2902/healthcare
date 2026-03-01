# Healthcare Application: Architecture, Scalability & Flow Report

## 1. Project Overview & Current Stack
The platform is a modern, full-stack healthcare application built on **Next.js 15**. It integrates medical management (medications, history, documents) with professional scheduling (consultations, availability, payments).

### Current Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Auth**: Better-Auth (SQLite + Drizzle)
- **Database**: Drizzle ORM + LibSQL (SQLite)
- **UI/UX**: Tailwind CSS 4 + Radix UI + Framer Motion
- **Icons**: Lucide & Tabler Icons

---

## 2. Platform Architecture & User Flow

### Sitemap & Navigation Hierarchy
The following structure defines the current and planned page links:

#### Public Pages (Guest View)
- **Home (`/`)**: Hero section, services overview, search doctor entry point, testimonials.
- **Services (`/services`)**: Detailed list of medical categories and specialties.
- **Specialists (`/specialists`)**: Searchable directory of doctors and healthcare professionals.
- **How It Works (`/how-it-works`)**: Educational content on booking and consultation flow.
- **Contact (`/contact`)**: Support forms and contact details.
- **Auth (`/login`, `/register`)**: Entry points for Clients and Professionals.

#### Authenticated Pages (Client/Patient)
- **Dashboard (`/dashboard`)**: Overview of upcoming appointments, recent meds, and health stats.
- **Book Consultation (`/book-consultation`)**: Selection flow (Specialist -> Date/Time -> Payment).
- **Medical Records**:
  - `/dashboard/history`: Past diagnoses and conditions.
  - `/dashboard/medications`: Active and past prescriptions.
  - `/dashboard/documents`: Uploaded lab reports and medical scans.
- **Insurance (`/dashboard/insurance`)**: Management of provider details and policies.

#### Authenticated Pages (Professional/Doctor)
- **Pro Dashboard (`/dashboard/pro`)**: Daily schedule, active consultation requests, and earnings summary.
- **Availability Management**: Set working days/hours and block-out times.
- **Consultation View**: Video/Audio meeting integration for active sessions.

---

## 3. Scalability Analysis & Replacements

To ensure the platform can handle thousands of concurrent users and complex data relationships, we should implement the following architectural shifts:

### A. Authentication & Authorization (Security)
- **Current**: Manual session checking in every API route.
- **Better/Scalable**: 
  - **Middleware-based Protection**: Implement a global middleware that handles session validation and redirects before the page/API logic even starts.
  - **RBAC (Role-Based Access Control)**: Strictly separate "Client" and "Professional" scopes using a centralized `checkRole` utility.

### B. Data Management & Validation
- **Current**: Manual `if (!data)` checks in API handlers.
- **Replace with Zod/TS**: 
  - Define **Shared Schemas** between the Frontend and Backend. Use Zod to validate every incoming POST/PUT request.
  - **Server Actions**: Transition internal form submissions from `fetch('/api/...')` to **Next.js Server Actions**. This reduces boilerplate and improves type safety.

### C. Performance & Asset Handling
- **Current**: Local static images and basic database queries.
- **Better/Scalable**:
  - **Edge Caching**: Use Next.js `fetch` tags and `revalidateTag` to cache doctor lists and specialist profiles globally.
  - **Media Storage**: Replace local file handling with an S3-compatible provider (e.g., R2 or AWS S3) for medical document uploads.
  - **Vector Search**: For finding specialists based on "Bio" or "Notes", implement a vector database (e.g., Pinecone or Turso's vector extension) to allow semantic search.

### D. Proposed Folder Structure Refactor
As the project grows, moving to a **Feature-Based Structure** is recommended:
```text
src/
  ├── features/
  │   ├── appointments/      # Components, Hooks, and Actions for booking
  │   ├── medical-records/    # History, Meds, Documents logic
  │   └── auth/               # Better-auth wrappers and UI
  ├── components/
  │   └── ui/                # Base Shadcn/Radix primitives
  └── lib/
      ├── db/                # Drizzle config and schema
      └── utils/             # Shared helpers
```

---

## 4. Immediate Improvements Roadmap

| Feature | Current State | Target State | Complexity |
| :--- | :--- | :--- | :--- |
| **Auth** | Path-by-path check | Global Middleware + HOCs | Medium |
| **Forms** | Controlled Inputs | React Hook Form + Zod Valdiation | Low |
| **API** | REST Routes | Server Actions for better UX/Speed | High |
| **Database** | SQLite Local | Turso (Distributed SQLite) | Low |
| **Styling** | Utility-heavy | Theme-based Design System | Low |

---

## 5. Visual Site Flow Map (Logical)
1. **Discovery**: Home -> Search Specialists -> View Profile.
2. **Commitment**: View Profile -> Click "Book" -> (Login Check) -> Register/Login.
3. **Action**: Login -> Select Time -> Payment -> Success.
4. **Follow-up**: Success -> Dashboard -> View Appointment -> Join Consultation.
5. **Record Keeping**: Consultation End -> Update Medical History -> View in Records.
---
---
---
---
---
---
---
## 6. Supabase Migration Plan (Complete Backend Replacement)

To leverage a fully managed backend with built-in Auth, Real-time, and PostgreSQL, we can transition to **Supabase**. This simplifies the stack by centralizing services.

### A. Core Architecture Changes

| Feature | Current Implementation | Supabase Replacement |
| :--- | :--- | :--- |
| **Auth** | Better-Auth (Server-side) | **Supabase Auth** (Native SSR support) |
| **Database** | SQLite (LibSQL) | **PostgreSQL** (Managed by Supabase) |
| **Real-time** | REST/Polling | **Supabase Realtime** (Channels & DB Listeners) |
| **Storage** | Local Files / Placeholder | **Supabase Storage** (S3-compatible buckets) |
| **Security** | Manual API Logic Checks | **Row Level Security (RLS)** (Policy-based) |

### B. Phase-by-Phase Integration Plan

#### Phase 1: Database & Schema Migration
1. **Re-target Drizzle**: Update `drizzle.config.ts` to use `pg` (Postgres) instead of `sqlite`.
2. **Schema Update**: Update `schema.ts` to use Postgres-specific types (e.g., `pgTable`, `uuid`, etc.).
3. **Data Sync**: Use Supabase's migration tools to push the local SQLite schema to the cloud Postgres instance.

#### Phase 2: Auth Transition
1. **Install SDK**: Add `@supabase/supabase-js` and `@supabase/ssr`.
2. **Middleware**: Replace manual session logic with Supabase `createMiddlewareClient`.
3. **User Sync**: Set up a **Postgres Trigger** to automatically create a `public.user` profile whenever a user signs up via Supabase Auth.

#### Phase 3: Real-time Capabilities
1. **Chat/Notifications**: Replace API polling with `supabase.channel('room').on('postgres_changes', ...)`.
2. **Status Updates**: Automatically update the dashboard when an appointment status changes in the DB.

#### Phase 4: Storage for Medical Docs
1. Create a `medical-docs` bucket in Supabase.
2. Update the `Documents` component to use `supabase.storage.from('medical-docs').upload()`.
3. Secure the bucket so only the file owner can download/view files.

### C. What Needs to be REMOVED

To keep the codebase clean and avoid technical debt, remove these components:

1. **Packages**:
   - `better-auth` and `@better-auth/utils`.
   - `@libsql/client` (SQLite driver).
   - `oslo` (if not used elsewhere).
2. **Files/Directories**:
   - `src/lib/auth.ts` and `src/lib/auth-client.ts` (Better-auth configurations).
   - `src/app/api/auth/[...better-auth]/route.ts`.
   - Redundant **CRUD API Routes** (e.g., `src/app/api/medications/route.ts`): These can be replaced by direct Supabase client calls on the frontend, protected by RLS.
3. **Environment Variables**:
   - Remove `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`.
   - Replace with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

---

## 7. Scalability Comparison: Supabase vs. PostgreSQL

| Metric | Current (LibSQL/SQLite) | Supabase (Postgres) |
| :--- | :--- | :--- |
| **Concurrent Users** | Good (Single-writer limit) | Excellent (Postgres scale) |
| **Relational Depth** | Moderate | Unlimited |
| **Real-time Latency**| Polling (~2-5s) | Instant (<100ms) |
| **Maintenance** | Manual backups/sync | Fully managed / Automated |