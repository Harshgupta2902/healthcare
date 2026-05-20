# Rate limits — HealthHere

Reference for all request / signup rate limiting in this project.  
Last updated: **2026-05-20**

---

## Summary

| Feature | Rate limited? | Same rules? | Where enforced |
|--------|----------------|-------------|----------------|
| **Account registration** (`/register`) | **Yes** | IP + device | `signUp` server action |
| **Newsletter subscribe** (homepage) | **Yes** | IP + device (same limits) | `subscribeNewsletter` server action |
| **Login** | **No** | — | — |
| **Contact form** | **No** | — | — |
| **Guest book consultation** | **No** | — | — |

Registration and newsletter use **identical limits** but **separate counters** (different bucket prefixes).

---

## Shared rules (register + newsletter)

“Same device” = **same client IP** + **same device fingerprint hash**.

| Limit | Max attempts | Window |
|-------|----------------|--------|
| **Per minute** | 1 | 60 seconds |
| **Per hour** | 5 | 3600 seconds (1 hour) |

- Minute check runs first, then hour check.
- Each **allowed** attempt increments both buckets.
- Blocked attempts do **not** increment counters.
- Register and newsletter limits are **independent** (separate bucket keys).

### User messages

| Scope | Per minute | Per hour (5+) |
|-------|------------|----------------|
| **Register** | *You can register only one account per minute from this device…* | *Too many signups from this device…* |
| **Newsletter** | *You can subscribe only one email per minute from this device…* | *Too many newsletter signups from this device…* |

### Invalid device fingerprint

Missing or invalid `deviceHash` (must be 64-char hex SHA-256):

- Request **rejected** on both flows.
- Message: *Unable to verify your device. Please refresh the page and try again.*

---

## Account registration (`/register`)

- Open to anyone; no existing account required.
- Flow: `register/page.tsx` → `getDeviceFingerprintHash()` → `signUp({ …, deviceHash })` → rate limit → Supabase Auth `signUp`.
- Bucket prefixes: `register_minute:`, `register_hour:`

### `signUp` input (Zod)

```ts
{
  email: string
  password: string   // min 8 chars
  name: string         // min 2 chars
  role: 'client' | 'professional'
  nameTitle?: string | null
  deviceHash: string   // 64-char hex SHA-256
}
```

### Error `code` values

| `code` | Meaning |
|--------|---------|
| `device_minute` | >1 register attempt per minute (same IP + device) |
| `device` | >5 per hour or invalid device hash |
| `validation` | Zod failed |

---

## Newsletter subscribe (public)

- Open to anyone (logged in or not); **only email** required.
- No link to `users` table.
- Flow: `NewsletterSubscribe` → `getDeviceFingerprintHash()` → `subscribeNewsletter({ email, deviceHash })` → rate limit → RPC `subscribe_newsletter`.
- Bucket prefixes: `newsletter_minute:`, `newsletter_hour:`

### `subscribeNewsletter` input (Zod)

```ts
{
  email: string      // valid email, max 320 chars
  deviceHash: string // 64-char hex SHA-256
}
```

### Error `code` values

| `code` | Meaning |
|--------|---------|
| `device_minute` | >1 subscribe attempt per minute (same IP + device) |
| `device` | >5 per hour or invalid device hash |

Rate limit runs **before** checking if email is already subscribed (abuse protection).

---

## How “same device” is identified

### Client IP (server)

1. `x-forwarded-for` (first IP)
2. `x-real-ip`
3. `unknown`

**Code:** `getClientIpFromHeaders()` in `src/lib/device-rate-limit.ts`

### Device fingerprint (browser)

| Signal | Source |
|--------|--------|
| Persistent ID | `localStorage` → `hh_device_id` |
| User agent | `navigator.userAgent` |
| Language | `navigator.language` |
| Timezone | `Intl.DateTimeFormat().resolvedOptions().timeZone` |
| Screen | `width x height` + `colorDepth` |
| Platform | `navigator.platform` |

Joined with `|`, hashed with **SHA-256** → 64-char hex sent to server.

**Code:** `getDeviceFingerprintHash()` in `src/lib/device-fingerprint.ts`

### Combined bucket key format

```
{prefix}:{ip}|{deviceHash}
```

Examples:

- `register_minute:203.0.113.10|abc…`
- `register_hour:203.0.113.10|abc…`
- `newsletter_minute:203.0.113.10|abc…`
- `newsletter_hour:203.0.113.10|abc…`

---

## Database (Supabase)

### Table

`public.newsletter_rate_limits`

| Column | Type | Purpose |
|--------|------|---------|
| `bucket_key` | `TEXT` PK | e.g. `newsletter_hour:ip\|hash` |
| `attempt_count` | `INT` | Attempts in current window |
| `window_start` | `TIMESTAMPTZ` | Window start time |

RLS on; clients use RPC only.

### RPC

`public.try_newsletter_rate_limit(p_bucket_key, p_max_attempts, p_window_seconds)` → `TRUE` / `FALSE`

### Schema files

- `SUPABASE_SETUP.sql`
- `updates.sql` (2026-05-20 block)

---

## Application code map

| File | Role |
|------|------|
| `src/lib/device-rate-limit.ts` | Shared limits, `assertSignupRateLimits()`, `assertNewsletterRateLimits()` |
| `src/lib/device-fingerprint.ts` | Client hash (register + newsletter) |
| `src/features/profile/actions.ts` | `signUp()` |
| `src/app/register/page.tsx` | Register form |
| `src/features/client/actions.ts` | `subscribeNewsletter()` |
| `src/components/NewsletterSubscribe.tsx` | Newsletter form |

---

## Changing limits

Edit `COMBINED_LIMITS` in `src/lib/device-rate-limit.ts`:

```ts
const COMBINED_LIMITS = {
  perMinute: { max: 1, windowSeconds: 60 },
  perHour: { max: 5, windowSeconds: 3600 },
}
```

Edit per-scope messages in `SCOPE_CONFIG` in the same file.

Deploy app only — no SQL change unless bucket prefixes change.

---

## Support / ops: reset blocks

```sql
-- Register only
DELETE FROM public.newsletter_rate_limits
WHERE bucket_key LIKE 'register_%:203.0.113.10|%';

-- Newsletter only
DELETE FROM public.newsletter_rate_limits
WHERE bucket_key LIKE 'newsletter_%:203.0.113.10|%';

-- Both for one IP
DELETE FROM public.newsletter_rate_limits
WHERE bucket_key LIKE '%:203.0.113.10|%';
```

Windows also expire automatically after 60s / 1h.

---

## Not rate limited

- Login / password reset
- Unsubscribe link (`/unsubscribe`)
- Admin newsletter CRUD / broadcasts
- Contact / enquiry forms
- Guest appointment booking

---

## Quick checklist

1. **Register** and **newsletter** = same numbers (1/min, 5/hr), different bucket prefixes.
2. Both need **deviceHash** from the browser.
3. Storage = Postgres RPC (serverless-safe).
4. Change limits in `device-rate-limit.ts`; keep this doc in sync.
