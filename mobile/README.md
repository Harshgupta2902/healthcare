# HealthHere Mobile (Flutter)

Client + Professional app only. **No admin features** in mobile.

## Prerequisites (on your dev machine)

- [Flutter SDK](https://docs.flutter.dev/get-started/install) 3.16+
- Android Studio / Xcode for emulators (optional)

This folder was created **without** running `flutter` on the CI machine — copy it to a system with Flutter installed.

## First-time setup

```bash
cd mobile

# Generate platform folders if missing (android/, ios/)
flutter create . --org com.healthhere --project-name healthhere_mobile

flutter pub get
```

## Configuration

Copy `env.mobile.example` to `.env.mobile` and fill values (same Supabase project as the Next.js web app):

| Variable | Source (web) |
|----------|----------------|
| `SUPABASE_URL` | `NEXT_PUBLIC_SUPABASE_URL` |
| `SUPABASE_ANON_KEY` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `API_BASE_URL` | Your deployed Next.js URL |
| `WEB_BASE_URL` | Same — used for admin blocker link |

Run with env file:

```bash
flutter run --dart-define-from-file=.env.mobile
```

## Project structure

```
lib/
├── main.dart / app.dart
├── core/           # theme, router, supabase, dio, env
├── features/       # auth, onboarding, dashboard, client, consultants, profile
└── shared/         # widgets, models
```

## Roles

| Role | App behavior |
|------|----------------|
| `client` | Patient dashboard |
| `professional` | Doctor dashboard |
| `admin` | Blocked → `/admin-web-only` (open web + sign out) |

## API routes (Phase 1)

Only `POST /api/v1/auth/sync-session` is called after login. Other routes are stubbed in `lib/core/network/api_endpoints.dart` for Phase 2.

## Build

```bash
flutter build apk --dart-define-from-file=.env.mobile
flutter build ios --dart-define-from-file=.env.mobile
```

See [docs/FLUTTER_AND_API_PLAN.md](../docs/FLUTTER_AND_API_PLAN.md) for full planning.
