-- Put incremental SQL updates here. After applying on Supabase,
-- fold these changes into SUPABASE_SETUP.sql for the next reference.

-- 2026-06-10: Blog comment approval workflow — comments/replies require admin approval before public visibility.

-- Fix: only enforce publish rules when status/published_at change (not comment_count updates).
CREATE OR REPLACE FUNCTION public.blog_posts_enforce_publish_rules()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status = 'published' OR NEW.published_at IS NOT NULL THEN
      SELECT role INTO v_role FROM public.users WHERE id = auth.uid();
      IF v_role IS DISTINCT FROM 'admin' THEN
        RAISE EXCEPTION 'Only admins can publish blog posts.';
      END IF;
    END IF;
    IF NEW.status = 'published' AND NEW.published_at IS NULL THEN
      NEW.published_at := NOW();
    END IF;
    IF NEW.status IN ('draft', 'pending_review') THEN
      NEW.published_at := NULL;
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status OR NEW.published_at IS DISTINCT FROM OLD.published_at THEN
    IF NEW.status = 'published' OR NEW.published_at IS NOT NULL THEN
      SELECT role INTO v_role FROM public.users WHERE id = auth.uid();
      IF v_role IS DISTINCT FROM 'admin' THEN
        RAISE EXCEPTION 'Only admins can publish blog posts.';
      END IF;
    END IF;
    IF NEW.status = 'published' AND NEW.published_at IS NULL THEN
      NEW.published_at := NOW();
    END IF;
    IF NEW.status IN ('draft', 'pending_review') THEN
      NEW.published_at := NULL;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Update counter function before any comment row updates (trigger fires on comment changes).
CREATE OR REPLACE FUNCTION public.refresh_blog_comment_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_id UUID;
BEGIN
  v_post_id := COALESCE(NEW.post_id, OLD.post_id);
  UPDATE public.blog_posts
     SET comment_count = (
       SELECT COUNT(*)::BIGINT FROM public.blog_comments
       WHERE post_id = v_post_id AND deleted_at IS NULL AND status = 'approved'
     )
   WHERE id = v_post_id;
  RETURN COALESCE(NEW, OLD);
END;
$$;

ALTER TABLE public.blog_comments
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected'));

ALTER TABLE public.blog_comments
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

ALTER TABLE public.blog_comments
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- Existing comments stay visible
UPDATE public.blog_comments
   SET status = 'approved'
 WHERE deleted_at IS NULL
   AND status = 'pending'
   AND reviewed_at IS NULL;

DROP POLICY IF EXISTS "Read comments on published posts" ON public.blog_comments;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'blog_comments'
      AND policyname = 'Read approved comments on published posts'
  ) THEN
    CREATE POLICY "Read approved comments on published posts" ON public.blog_comments FOR SELECT TO anon, authenticated
    USING (
      deleted_at IS NULL
      AND status = 'approved'
      AND EXISTS (SELECT 1 FROM public.blog_posts p WHERE p.id = post_id AND p.status = 'published')
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'blog_comments'
      AND policyname = 'Users read own pending comments'
  ) THEN
    CREATE POLICY "Users read own pending comments" ON public.blog_comments FOR SELECT TO authenticated
    USING (
      user_id = auth.uid()
      AND status = 'pending'
      AND deleted_at IS NULL
      AND EXISTS (SELECT 1 FROM public.blog_posts p WHERE p.id = post_id AND p.status = 'published')
    );
  END IF;
END$$;

DROP POLICY IF EXISTS "Engagement users insert comments" ON public.blog_comments;
CREATE POLICY "Engagement users insert comments" ON public.blog_comments FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND status = 'pending'
  AND EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('client', 'professional'))
  AND EXISTS (SELECT 1 FROM public.blog_posts p WHERE p.id = post_id AND p.status = 'published')
);

-- Recalculate counts after migration
UPDATE public.blog_posts bp
   SET comment_count = (
     SELECT COUNT(*)::BIGINT FROM public.blog_comments c
     WHERE c.post_id = bp.id AND c.deleted_at IS NULL AND c.status = 'approved'
   );

CREATE OR REPLACE FUNCTION public.blog_comments_enforce_status_rules()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status IS DISTINCT FROM 'pending' THEN
      SELECT role INTO v_role FROM public.users WHERE id = auth.uid();
      IF v_role IS DISTINCT FROM 'admin' THEN
        NEW.status := 'pending';
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    SELECT role INTO v_role FROM public.users WHERE id = auth.uid();
    IF v_role IS DISTINCT FROM 'admin' THEN
      RAISE EXCEPTION 'Only admins can approve or reject comments.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_blog_comments_enforce_status_rules ON public.blog_comments;
CREATE TRIGGER trg_blog_comments_enforce_status_rules
  BEFORE INSERT OR UPDATE ON public.blog_comments
  FOR EACH ROW EXECUTE PROCEDURE public.blog_comments_enforce_status_rules();
