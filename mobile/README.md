# HealthHere Mobile (Flutter)

Client + Professional app only. **No admin features** in mobile.

Phases **1–3 implemented** (foundation, professional + booking APIs, polish: offline cache, biometrics, assistant, prescriptions).

## Prerequisites (on your dev machine)

- [Flutter SDK](https://docs.flutter.dev/get-started/install) 3.16+
- Android Studio / Xcode for emulators (optional)

## First-time setup

```bash
cd mobile
flutter create . --org com.healthhere --project-name healthhere_mobile
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

## Features by phase

### Phase 1
- Auth (login, register, forgot password, role routing)
- Client dashboard, medical history, medications, appointments
- Consultant directory (Supabase SDK)
- Profile edit, settings

### Phase 2
- Professional dashboard (consultations, calendar, clients, credentials)
- Guest booking flow + booking success
- Blog feed, post detail, comments, likes
- Medical documents + insurance (Storage SDK)
- Contact form (API)
- All `/api/v1` routes on Next.js — see [docs/API.md](../docs/API.md)

### Phase 3
- AI assistant screen (API context)
- Prescription compose + send (API)
- Hive offline cache for dashboard
- Biometric unlock toggle (local_auth)

## Roles

| Role | App behavior |
|------|----------------|
| `client` | Patient dashboard |
| `professional` | Doctor dashboard |
| `admin` | Blocked → `/admin-web-only` (web only) |

## Build

```bash
flutter build apk --dart-define-from-file=.env.mobile
flutter build ios --dart-define-from-file=.env.mobile
```

See [docs/FLUTTER_AND_API_PLAN.md](../docs/FLUTTER_AND_API_PLAN.md) for architecture and screen inventory.
