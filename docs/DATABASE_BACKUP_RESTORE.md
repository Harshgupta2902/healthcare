# Database backup and restore

## Backup (full SQL dump)

1. In [Supabase Dashboard](https://supabase.com/dashboard) → **Project Settings** → **Database**, copy the **database password** (reset if needed).
2. Add to `.env` (do not commit). From **Database → Connection string → Session pooler**:

   ```env
   SUPABASE_DB_PASSWORD=your-database-password
   SUPABASE_DB_HOST=aws-1-ap-northeast-1.pooler.supabase.com
   SUPABASE_DB_USER=postgres.your-project-ref
   ```

   `NEXT_PUBLIC_SUPABASE_URL` must already be set. Use **PostgreSQL 17** `pg_dump` (Supabase runs PG 17); install from [postgresql.org](https://www.postgresql.org/download/windows/) if `npm run db:backup` reports a version mismatch.

3. Run:

   ```bash
   npm run db:backup
   ```

   This creates **`backup.sql`** in the project root (schema + data, portable for a new Postgres/Supabase project).

`backup.sql` is gitignored because it contains patient/user data.

## Restore into a new Supabase project

1. Create a new Supabase project.
2. Set `.env` to the **new** project URL and `SUPABASE_DB_PASSWORD`.
3. Run:

   ```bash
   npm run db:restore
   ```

4. In the new project **Authentication** → **URL configuration**, add your app URLs.
5. Re-create **Storage** buckets and policies if you use file storage (not included in a plain SQL dump unless you dump those schemas too).
6. Update Vercel/local env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and service role if used.

## Schema-only fallback

If you only need structure (no row data), apply `SUPABASE_SETUP.sql` and `updates.sql` in the SQL editor instead.
