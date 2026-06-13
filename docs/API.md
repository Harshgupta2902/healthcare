# HealthHere Mobile API (`/api/v1`)

REST endpoints for the Flutter app. All authenticated routes expect:

```
Authorization: Bearer <supabase_access_token>
```

## Response envelope

```json
{ "success": true, "data": { }, "error": null }
{ "success": false, "data": null, "error": { "message": "...", "code": "..." } }
```

## Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/api/v1/auth/sync-session` | Yes | Sync `users` row + JWT role metadata |
| `GET` | `/api/v1/places/search?q=` | No | Indian cities autocomplete |
| `POST` | `/api/v1/booking/guest` | Optional | Create guest appointment |
| `GET` | `/api/v1/booking/guest/:id/confirm` | No | Booking confirmation (RPC) |
| `POST` | `/api/v1/meetings/create` | Yes | Create Meet/Jitsi link + save URL |
| `POST` | `/api/v1/meetings/guest/pipeline` | Yes | Full meeting pipeline (owner/pro) |
| `POST` | `/api/v1/contact` | No | Contact form (`deviceHash` required) |
| `POST` | `/api/v1/newsletter/unsubscribe` | No | HMAC token unsubscribe |
| `GET` | `/api/v1/universities/search?q=` | No | Institution search |
| `POST` | `/api/v1/prescriptions/send` | Yes (pro) | Save prescription HTML on guest booking |
| `GET` | `/api/v1/assistant/context` | Optional | AI assistant page context |

## Implementation files

- `src/lib/api/auth.ts` — Bearer Supabase client
- `src/lib/api/response.ts` — JSON envelope helpers
- `src/app/api/v1/**/route.ts` — Route handlers

## Mobile client

See `mobile/lib/core/network/api_repository.dart` and `api_endpoints.dart`.
