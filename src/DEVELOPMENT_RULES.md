# Development Rules

- **UI Persistence**: DO NOT change the existing UI, styling, or layouts unless explicitly requested by the user. When refactoring logic or moving to server-side data fetching, strictly maintain the current JSX/TSX structure and CSS classes.
- **Supabase-First**: Use Supabase for Auth, Database, and Storage.
- **Server Actions**: Use Next.js Server Actions for all mutations.
- **Validation**: Use Zod for all form and server action validation.
- **Row Level Security**: Ensure all tables have RLS enabled and proper policies in place.
- **Rate limits**: See [docs/RATE_LIMITS.md](../docs/RATE_LIMITS.md) for registration vs newsletter limits, bucket keys, and how to change or reset them.
