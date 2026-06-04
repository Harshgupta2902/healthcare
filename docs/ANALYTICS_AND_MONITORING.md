# Analytics — HealthHere

**Last updated:** 2026-06-04

HealthHere uses **Vercel Analytics** for traffic and Web Vitals on deployments hosted on Vercel. Firebase Analytics and Crashlytics have been removed from the codebase.

---

## What runs today

| Tool | Package | Where |
|------|---------|--------|
| **Vercel Analytics** | `@vercel/analytics` | `src/app/layout.tsx` — `<Analytics />` |

- Activates automatically on Vercel-hosted builds.
- View data in the Vercel dashboard → your project → **Analytics**.
- No extra environment variables are required in this repo.

---

## Local development

Vercel Analytics typically reports **production** traffic. Local `npm run dev` does not send analytics to Vercel unless you use Vercel’s preview/production URLs.

---

## Privacy

The [Privacy Policy](/privacy) describes Vercel Analytics as the analytics service. Medical or form data is not sent to analytics tools by design.

---

## Related docs

- [RATE_LIMITS.md](./RATE_LIMITS.md) — API rate limiting (separate from analytics)
