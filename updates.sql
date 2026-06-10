-- Put incremental SQL updates here. After applying on Supabase,
-- fold these changes into SUPABASE_SETUP.sql for the next reference.

-- 2026-06-10: Blog cover images — Supabase Storage bucket (replaces local public/uploads/blogs).

INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-covers', 'blog-covers', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Public blog cover images are viewable by everyone'
  ) THEN
    CREATE POLICY "Public blog cover images are viewable by everyone" ON storage.objects FOR SELECT
    USING (bucket_id = 'blog-covers');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Blog authors upload own blog cover images'
  ) THEN
    CREATE POLICY "Blog authors upload own blog cover images" ON storage.objects FOR INSERT WITH CHECK (
      bucket_id = 'blog-covers'
      AND auth.uid()::text = (storage.foldername(name))[1]
      AND EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = auth.uid() AND u.role IN ('admin', 'client', 'professional')
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Blog authors update own blog cover images'
  ) THEN
    CREATE POLICY "Blog authors update own blog cover images" ON storage.objects FOR UPDATE USING (
      bucket_id = 'blog-covers' AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Blog authors delete own blog cover images'
  ) THEN
    CREATE POLICY "Blog authors delete own blog cover images" ON storage.objects FOR DELETE USING (
      bucket_id = 'blog-covers' AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Admins manage all blog cover images'
  ) THEN
    CREATE POLICY "Admins manage all blog cover images" ON storage.objects FOR ALL TO authenticated
    USING (
      bucket_id = 'blog-covers'
      AND (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    )
    WITH CHECK (
      bucket_id = 'blog-covers'
      AND (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );
  END IF;
END$$;
