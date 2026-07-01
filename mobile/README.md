# HealthHere Mobile (Flutter)

Client + Professional app only. **No admin features** in mobile.

**Status (June 2026):** Phase 1 mostly complete · Phase 2 partial · Phase 3 mostly pending.  
See [docs/FLUTTER_AND_API_PLAN.md](../docs/FLUTTER_AND_API_PLAN.md) for the full parity matrix and flow diagrams.

## Prerequisites

- [Flutter SDK](https://docs.flutter.dev/get-started/install) 3.16+
- Android Studio / Xcode for emulators (optional)

## First-time setup

```bash
cd mobile
flutter pub get
```

Copy `env.mobile.example` → `.env.mobile`:

| Variable | Source (web) |
|----------|----------------|
| `SUPABASE_URL` | `NEXT_PUBLIC_SUPABASE_URL` |
| `SUPABASE_ANON_KEY` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `API_BASE_URL` | Deployed Next.js URL (for `/api/v1/*`) |
| `WEB_BASE_URL` | Same — admin blocker link |

```bash
flutter run --dart-define-from-file=.env.mobile
```

## Implementation status by phase

### Phase 1 — Foundation ✅ Mostly done

- [x] Auth (login, register, forgot password, role routing)
- [x] Client dashboard shell (home, search, history, profile)
- [x] Medical history, medications, documents, insurance (Supabase SDK + Storage)
- [x] Consultant directory + detail (Supabase SDK)
- [x] Profile edit, settings (logout)
- [x] `POST /api/v1/auth/sync-session` after login/signup
- [ ] Session restore on splash (always routes to `/login` today)
- [ ] Clean up orphaned legacy screens (`*AccountScreen`, `BookScreen`, etc.)

### Phase 2 — Professional + booking 🟡 Partial

- [x] Professional dashboard (home, requests, calendar, clients, profile)
- [x] Availability CRUD, credentials + document upload
- [x] Guest booking flow replaced by Supabase SDK + Razorpay checkout
- [x] Contact form (`POST /api/v1/contact`)
- [x] Prescription compose + send (`POST /api/v1/prescriptions/send`)
- [x] Booking payment APIs (`razorpay`, `verify`, `confirm-free`) — see [docs/API.md](../docs/API.md)
- [ ] Blog read + engagement
- [ ] Meeting join / pipeline wired in UI
- [ ] Logged-in appointment booking + cancel/status UI

### Phase 3 — Polish & parity ❌ Mostly pending

- [x] Hive offline cache (client dashboard only)
- [ ] AI assistant screen (`GET /api/v1/assistant/context` — API exists, no screen)
- [ ] Biometric unlock toggle (`BiometricService` exists, no Settings UI)
- [ ] Professional payments screen (placeholder exists, not routed)
- [ ] Author blog screens
- [ ] OTP registration (match web)
- [ ] Push notifications (FCM)
- [ ] Analytics, App Store review

## Roles

| Role | App behavior |
|------|----------------|
| `client` | Patient dashboard — tabs: Home · Search · History · Profile |
| `professional` | Doctor dashboard — tabs: Home · Requests · Calendar · Clients · Profile |
| `admin` | Blocked → `/admin-web-only` (open web admin + sign out) |

## Architecture (short)

```
Flutter UI → Riverpod repositories
              ├── Supabase SDK (auth, CRUD, storage) — primary
              ├── Dio → Next.js /api/v1/* — server-only flows
              └── Hive — client dashboard offline fallback
```

Full Mermaid flow diagrams: [FLUTTER_AND_API_PLAN.md §18](../docs/FLUTTER_AND_API_PLAN.md#18-app-flow-diagrams-mermaid).

## Key routes

| Route | Screen |
|-------|--------|
| `/splash` → `/onboarding` or `/login` | Bootstrap |
| `/login`, `/register`, `/forgot-password` | Auth |
| `/home`, `/search`, `/history`, `/profile` | Client shell |
| `/home`, `/requests`, `/calendar`, `/clients`, `/profile` | Pro shell |
| `/book/:professionalUserId` | Book consultation (public form) |
| `/book/:professionalUserId/checkout` | Razorpay checkout (client auth required) |
| `/prescription/:guestAppointmentId` | Pro prescription send |
| `/consultants/:userId` | Consultant detail |
| `/contact` | Contact form |
| `/settings` | Settings |

## Build

```bash
flutter build apk --dart-define-from-file=.env.mobile
flutter build ios --dart-define-from-file=.env.mobile
```

## Related docs

- [FLUTTER_AND_API_PLAN.md](../docs/FLUTTER_AND_API_PLAN.md) — architecture, parity matrix, Mermaid flows
- [API.md](../docs/API.md) — REST endpoint reference
