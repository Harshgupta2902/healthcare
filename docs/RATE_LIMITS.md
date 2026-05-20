# Rate limits — HealthHere

Reference for all request / signup rate limiting in this project.  
Last updated: **2026-05-20**

---

## Summary

| Feature | Rate limited? | IP + device | Per email | Where enforced |
|--------|----------------|-------------|-----------|----------------|
| **Account registration** (`/register`) | **Yes** | 1/min, 5/hr | 3/day | `signUp` server action |
| **Newsletter subscribe** (homepage) | **Yes** | 1/min, 5/hr | 3/hr | `subscribeNewsletter` server action |
| **Login** (`/login`) | **Yes** | 5/min, 20/hr | 10/hr | `signIn` server action |
| **Contact form** (`/contact`) | **Yes** | 2/min, 10/hr | 5/hr | `submitContactForm` server action |
| **Guest book consultation** | **Yes** | 2/min, 10/hr | 5/hr | `submitGuestAppointment` server action |
| **Unsubscribe link** (`/unsubscribe`) | **No** | — | — | — |
| **Admin newsletter CRUD / broadcasts** | **No** | — | — | Trusted role |
| **Password reset** | **No** | — | — | Supabase Auth default |

Each flow uses **separate bucket prefixes** in `public.newsletter_rate_limits`.

---

## Limits by feature

### Registration & newsletter (unchanged device rules)

| Limit | Register | Newsletter |
|-------|----------|------------|
| Per minute (IP+device) | 1 | 1 |
| Per hour (IP+device) | 5 | 5 |
| Per email | 3/day | 3/hour |

### Login

| Limit | Value |
|-------|--------|
| Per minute (IP+device) | 5 |
| Per hour (IP+device) | 20 |
| Per email (hour) | 10 |

Failed logins still consume buckets (checked before `signInWithPassword`). Auth errors return a generic *Invalid email or password.*

### Contact form

| Limit | Value |
|-------|--------|
| Per minute (IP+device) | 2 |
| Per hour (IP+device) | 10 |
| Per email (hour) | 5 |

### Guest consultation booking

| Limit | Value |
|-------|--------|
| Per minute (IP+device) | 2 |
| Per hour (IP+device) | 10 |
| Per email (hour) | 5 |

---

## How limits are enforced

1. Browser builds **device fingerprint** → SHA-256 hex (`getDeviceFingerprintHash()`).
2. Form submits `deviceHash` with the server action payload.
3. Server reads **IP** from `x-forwarded-for` / `x-real-ip`.
4. RPC `try_newsletter_rate_limit` increments buckets in Postgres (serverless-safe).

### Bucket key formats

```
{scope}_minute:{ip}|{deviceHash}
{scope}_hour:{ip}|{deviceHash}
{scope}_email_hour:{normalizedEmail}    # login, newsletter, contact, guest_booking
register_email_day:{normalizedEmail}    # register only
```

Scopes: `register`, `newsletter`, `login`, `contact`, `guest_booking`.

### Invalid device fingerprint

Missing or invalid `deviceHash` (must be 64-char hex):

- Request **rejected** on all limited flows.
- Message: *Unable to verify your device. Please refresh the page and try again.*

---

## Application code map

| File | Role |
|------|------|
| `src/lib/device-rate-limit.ts` | All scopes, limits, `assert*RateLimits()` helpers |
| `src/lib/device-fingerprint.ts` | Client SHA-256 hash |
| `src/features/profile/actions.ts` | `signUp()`, `signIn()` |
| `src/app/register/page.tsx` | Register form |
| `src/app/login/page.tsx` | Login form |
| `src/features/client/actions.ts` | `subscribeNewsletter()` |
| `src/components/NewsletterSubscribe.tsx` | Newsletter form |
| `src/features/contact/actions.ts` | `submitContactForm()` |
| `src/app/contact/page.tsx` | Contact form |
| `src/app/book-consultation/actions.ts` | `submitGuestAppointment()` |
| `src/app/book-consultation/BookConsultationContent.tsx` | Booking form |

---

## Changing limits

Edit `SCOPE_LIMITS` in `src/lib/device-rate-limit.ts`, then update this doc.

Deploy app only — no SQL change unless bucket prefix names change.

---

## Support / ops: reset blocks

```sql
-- All limits for one IP
DELETE FROM public.newsletter_rate_limits
WHERE bucket_key LIKE '%:203.0.113.10|%';

-- Login only for one email
DELETE FROM public.newsletter_rate_limits
WHERE bucket_key LIKE 'login_email_hour:victim@example.com';

-- Register device buckets
DELETE FROM public.newsletter_rate_limits
WHERE bucket_key LIKE 'register_%';
```

Windows expire automatically after their configured duration.

---

## Limitations (abuse throttles, not full bot defense)

- `deviceHash` is client-generated and can be spoofed (new hash per attempt).
- IP headers can be rotated behind proxies.
- Use **CAPTCHA** (e.g. Turnstile) and edge **WAF** for production if abuse continues.

See [SECURITY_FIXES.md](./SECURITY_FIXES.md) §4 for threat context.
