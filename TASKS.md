# Project Tasks & Roadmap

## 📂 Phase 0: Foundation & Migration
- [ ] **Infrastructure Setup**
  - [ ] Initialize Supabase project (PostgreSQL).
  - [ ] Migrate Drizzle schema from SQLite to PostgreSQL.
  - [ ] Set up Supabase Auth and configure SSR.
- [ ] **Auth Transition**
  - [ ] Replace `better-auth` with Supabase Auth client.
  - [ ] Implement global `middleware.ts` for route protection.
  - [ ] Sync User table with Auth state using Postgres Triggers.

## 🏗️ Phase 1: Core Architecture Refactor
- [ ] **Directory Reorganization**
  - [ ] Move components to `src/features/[name]` based on domain (auth, appointments, medical-records).
  - [ ] Centralize shared UI components in `src/components/ui`.
- [ ] **Data Handling Logic**
  - [ ] Convert `fetch` based API calls to **Next.js Server Actions**.
  - [ ] Implement **Zod** schemas for all form validations and action inputs.
  - [ ] Set up centralized error handling for Server Actions.

## 🏥 Phase 2: Patient/Client Experience
- [ ] **Booking System**
  - [ ] Implement specialist search & filter (Specialty, Availability, Rating).
  - [ ] Build multi-step booking flow (Select Doctor -> Choose Slot -> Payment).
  - [ ] Integrate Stripe or LemonSqueezy for consultation payments.
- [ ] **Medical Dashboard**
  - [ ] Create `History` view for past diagnoses.
  - [ ] Create `Medications` tracker with reminder indicators.
  - [ ] Create `Documents` vault (Lab reports/Scans) using Supabase Storage.
- [ ] **Insurance Management**
  - [ ] Add forms to manage insurance provider details and policy numbers.

## 👨‍⚕️ Phase 3: Professional/Doctor Experience
- [ ] **Professional Dashboard**
  - [ ] Build daily schedule/calendar view.
  - [ ] Implement "Accept/Reject" workflow for consultation requests.
- [ ] **Availability Logic**
  - [ ] Build interface to set working hours and recurring days off.
  - [ ] Implement slot generation logic based on availability.
- [ ] **Consultation Interface**
  - [ ] Integrate Agora or daily.co for Video/Audio calls.
  - [ ] Add real-time note-taking during consultations.

## ✨ Phase 4: Polish & Performance
- [ ] **Visual Enhancements**
  - [ ] Add Framer Motion transitions between dashboard pages.
  - [ ] Implement loading skeletons for all data-heavy sections.
  - [ ] Refine "Glassmorphism" UI tokens and Dark Mode consistency.
- [ ] **Optimization**
  - [ ] Implement `revalidateTag` for doctor listings.
  - [ ] Optimize images using Next.js `<Image />` component.
  - [ ] Add Semantic Search for professionals using pgvector.

## 🛠️ Maintenance & DevOps
- [ ] Set up CI/CD pipeline (GitHub Actions).
- [ ] Configure automatic database backups.
- [ ] Implement Sentry for error tracking.
