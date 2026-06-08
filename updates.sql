-- Put incremental SQL updates here. After applying on Supabase,
-- fold these changes into SUPABASE_SETUP.sql for the next reference.

-- 2026-05-10: Newsletter activity → admin notifications.
-- Fires on subscriber insert or status change (subscribe / unsubscribe / resubscribe / reactivate).
-- actor_user_id resolves to auth.uid() when an authenticated user (e.g. admin via the Ban icon)
-- triggers the change; NULL for anonymous footer signups and email unsubscribe link clicks.
-- SECURITY DEFINER so the insert succeeds regardless of the caller's RLS context.
CREATE OR REPLACE FUNCTION public.admin_notify_on_newsletter_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_type TEXT;
  v_title TEXT;
  v_body TEXT;
  v_actor UUID := auth.uid();
  v_prev TEXT := CASE WHEN TG_OP = 'UPDATE' THEN OLD.status ELSE NULL END;
BEGIN
  -- actor_user_id FKs public.users; clear it when no app-level row exists for the auth user.
  IF v_actor IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.users WHERE id = v_actor) THEN
    v_actor := NULL;
  END IF;

  IF TG_OP = 'INSERT' THEN
    v_type := 'newsletter.subscribed';
    v_title := 'New newsletter subscription';
    v_body := NEW.email || ' subscribed to the newsletter.';
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status IS NOT DISTINCT FROM OLD.status THEN
      RETURN NEW;
    END IF;
    IF NEW.status = 'unsubscribed' THEN
      v_type := 'newsletter.unsubscribed';
      v_title := 'Newsletter unsubscribe';
      v_body := NEW.email || ' unsubscribed from the newsletter.';
    ELSIF NEW.status = 'resubscribed' THEN
      v_type := 'newsletter.resubscribed';
      v_title := 'Newsletter resubscribe';
      v_body := NEW.email || ' resubscribed to the newsletter.';
    ELSIF NEW.status = 'active' AND OLD.status IN ('unsubscribed', 'resubscribed') THEN
      v_type := 'newsletter.resubscribed';
      v_title := 'Newsletter reactivated';
      v_body := NEW.email || ' was reactivated.';
    ELSE
      RETURN NEW;
    END IF;
  ELSE
    RETURN NEW;
  END IF;

  INSERT INTO public.admin_notifications (type, title, body, actor_user_id, metadata)
  VALUES (
    v_type,
    v_title,
    v_body,
    v_actor,
    jsonb_build_object(
      'subscriber_id', NEW.id,
      'email', NEW.email,
      'status', NEW.status,
      'previous_status', v_prev
    )
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_admin_notify_newsletter_change ON public.newsletter_subscribers;
CREATE TRIGGER trg_admin_notify_newsletter_change
  AFTER INSERT OR UPDATE OF status ON public.newsletter_subscribers
  FOR EACH ROW
  EXECUTE PROCEDURE public.admin_notify_on_newsletter_change();

-- 2026-05-16: Booking success page — read appointment by id (anon-safe, UUID in URL).
-- SECURITY DEFINER returns only confirmation fields; bypasses guest_appointments SELECT RLS.
CREATE OR REPLACE FUNCTION public.get_guest_appointment_confirmation(p_id UUID)
RETURNS JSON
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'id', g.id,
    'category', g.category,
    'appointment_date', g.appointment_date,
    'appointment_time', g.appointment_time,
    'professional_id', g.professional_id
  )
  FROM public.guest_appointments g
  WHERE g.id = p_id
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_guest_appointment_confirmation(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_guest_appointment_confirmation(UUID) TO anon, authenticated;

-- 2026-05-20: Newsletter signup rate limits (IP 5/hr, email 1/15min, device 5/hr).
CREATE TABLE IF NOT EXISTS public.newsletter_rate_limits (
  bucket_key TEXT PRIMARY KEY,
  attempt_count INT NOT NULL DEFAULT 0,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.newsletter_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.try_newsletter_rate_limit(
  p_bucket_key TEXT,
  p_max_attempts INT,
  p_window_seconds INT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INT;
  v_window_start TIMESTAMPTZ;
  v_now TIMESTAMPTZ := NOW();
BEGIN
  IF p_bucket_key IS NULL OR length(trim(p_bucket_key)) = 0 THEN
    RETURN FALSE;
  END IF;
  IF p_max_attempts IS NULL OR p_max_attempts < 1 OR p_window_seconds IS NULL OR p_window_seconds < 1 THEN
    RAISE EXCEPTION 'Invalid rate limit parameters' USING ERRCODE = '22023';
  END IF;

  SELECT attempt_count, window_start
    INTO v_count, v_window_start
    FROM public.newsletter_rate_limits
   WHERE bucket_key = p_bucket_key
   FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.newsletter_rate_limits (bucket_key, attempt_count, window_start)
    VALUES (p_bucket_key, 1, v_now);
    RETURN TRUE;
  END IF;

  IF v_window_start + (p_window_seconds || ' seconds')::INTERVAL <= v_now THEN
    UPDATE public.newsletter_rate_limits
       SET attempt_count = 1,
           window_start = v_now
     WHERE bucket_key = p_bucket_key;
    RETURN TRUE;
  END IF;

  IF v_count >= p_max_attempts THEN
    RETURN FALSE;
  END IF;

  UPDATE public.newsletter_rate_limits
     SET attempt_count = attempt_count + 1
   WHERE bucket_key = p_bucket_key;

  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.try_newsletter_rate_limit(TEXT, INT, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.try_newsletter_rate_limit(TEXT, INT, INT) TO anon, authenticated;

-- 2026-05-20: One weekly availability row per professional per weekday (prevents duplicate Monday slots).
-- Run once. If this fails, dedupe duplicates first (see DELETE below), then re-run the CREATE UNIQUE INDEX.

DELETE FROM public.professional_availability a
USING public.professional_availability b
WHERE a.professional_id = b.professional_id
  AND a.day_of_week = b.day_of_week
  AND a.updated_at < b.updated_at;

CREATE UNIQUE INDEX IF NOT EXISTS professional_availability_professional_day_unique
  ON public.professional_availability (professional_id, day_of_week);

-- 2026-06-08: Blog CMS — categories, posts, comments, likes, view tracking.
-- Apply on Supabase, then fold into SUPABASE_SETUP.sql.

CREATE TABLE IF NOT EXISTS public.blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  content_html TEXT NOT NULL,
  cover_image_url TEXT,
  category_id UUID REFERENCES public.blog_categories(id) ON DELETE SET NULL,
  author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  meta_title TEXT,
  meta_description TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  view_count BIGINT NOT NULL DEFAULT 0,
  like_count BIGINT NOT NULL DEFAULT 0,
  comment_count BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT blog_posts_published_requires_category CHECK (
    status <> 'published' OR category_id IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS blog_posts_status_published_at_idx
  ON public.blog_posts (status, published_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS blog_posts_category_id_idx ON public.blog_posts (category_id);

CREATE TABLE IF NOT EXISTS public.blog_post_views (
  id BIGSERIAL PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  viewer_key TEXT NOT NULL,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (post_id, viewer_key)
);

CREATE TABLE IF NOT EXISTS public.blog_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS blog_comments_post_created_idx
  ON public.blog_comments (post_id, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.blog_post_likes (
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (post_id, user_id)
);

ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_likes ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.blog_categories TO anon, authenticated;
GRANT SELECT ON public.blog_posts TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_comments TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.blog_post_likes TO authenticated;

-- Categories: public reads active; admin full CRUD
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'blog_categories' AND policyname = 'Public read active blog categories') THEN
    CREATE POLICY "Public read active blog categories" ON public.blog_categories FOR SELECT TO anon, authenticated
    USING (is_active = TRUE);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'blog_categories' AND policyname = 'Admins manage blog categories') THEN
    CREATE POLICY "Admins manage blog categories" ON public.blog_categories FOR ALL TO authenticated
    USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin')
    WITH CHECK ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
  END IF;
END$$;

-- Posts: public reads published; admin full CRUD
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'blog_posts' AND policyname = 'Public read published blog posts') THEN
    CREATE POLICY "Public read published blog posts" ON public.blog_posts FOR SELECT TO anon, authenticated
    USING (status = 'published');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'blog_posts' AND policyname = 'Admins manage blog posts') THEN
    CREATE POLICY "Admins manage blog posts" ON public.blog_posts FOR ALL TO authenticated
    USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin')
    WITH CHECK ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
  END IF;
END$$;

-- Comments
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'blog_comments' AND policyname = 'Read comments on published posts') THEN
    CREATE POLICY "Read comments on published posts" ON public.blog_comments FOR SELECT TO anon, authenticated
    USING (
      deleted_at IS NULL
      AND EXISTS (SELECT 1 FROM public.blog_posts p WHERE p.id = post_id AND p.status = 'published')
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'blog_comments' AND policyname = 'Engagement users insert comments') THEN
    CREATE POLICY "Engagement users insert comments" ON public.blog_comments FOR INSERT TO authenticated
    WITH CHECK (
      user_id = auth.uid()
      AND EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('client', 'professional'))
      AND EXISTS (SELECT 1 FROM public.blog_posts p WHERE p.id = post_id AND p.status = 'published')
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'blog_comments' AND policyname = 'Users update own comments') THEN
    CREATE POLICY "Users update own comments" ON public.blog_comments FOR UPDATE TO authenticated
    USING (user_id = auth.uid() AND deleted_at IS NULL)
    WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'blog_comments' AND policyname = 'Admins manage all blog comments') THEN
    CREATE POLICY "Admins manage all blog comments" ON public.blog_comments FOR ALL TO authenticated
    USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin')
    WITH CHECK ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
  END IF;
END$$;

-- Likes
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'blog_post_likes' AND policyname = 'Read likes on published posts') THEN
    CREATE POLICY "Read likes on published posts" ON public.blog_post_likes FOR SELECT TO anon, authenticated
    USING (EXISTS (SELECT 1 FROM public.blog_posts p WHERE p.id = post_id AND p.status = 'published'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'blog_post_likes' AND policyname = 'Engagement users manage own likes') THEN
    CREATE POLICY "Engagement users manage own likes" ON public.blog_post_likes FOR ALL TO authenticated
    USING (
      user_id = auth.uid()
      AND EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('client', 'professional'))
    )
    WITH CHECK (
      user_id = auth.uid()
      AND EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('client', 'professional'))
      AND EXISTS (SELECT 1 FROM public.blog_posts p WHERE p.id = post_id AND p.status = 'published')
    );
  END IF;
END$$;

-- View count RPC
CREATE OR REPLACE FUNCTION public.increment_blog_post_view(p_post_id UUID, p_viewer_key TEXT)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_inserted BOOLEAN := FALSE;
  v_count BIGINT;
BEGIN
  IF p_viewer_key IS NULL OR length(trim(p_viewer_key)) < 8 THEN
    SELECT view_count INTO v_count FROM public.blog_posts WHERE id = p_post_id AND status = 'published';
    RETURN COALESCE(v_count, 0);
  END IF;

  INSERT INTO public.blog_post_views (post_id, viewer_key)
  VALUES (p_post_id, p_viewer_key)
  ON CONFLICT (post_id, viewer_key) DO NOTHING;

  GET DIAGNOSTICS v_inserted = ROW_COUNT;
  IF v_inserted THEN
    UPDATE public.blog_posts
       SET view_count = view_count + 1
     WHERE id = p_post_id AND status = 'published';
  END IF;

  SELECT view_count INTO v_count FROM public.blog_posts WHERE id = p_post_id AND status = 'published';
  RETURN COALESCE(v_count, 0);
END;
$$;

REVOKE ALL ON FUNCTION public.increment_blog_post_view(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_blog_post_view(UUID, TEXT) TO anon, authenticated;

-- Like toggle RPC
CREATE OR REPLACE FUNCTION public.toggle_blog_post_like(p_post_id UUID, p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_liked BOOLEAN := FALSE;
  v_count BIGINT;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = p_user_id AND u.role IN ('client', 'professional')
  ) THEN
    RAISE EXCEPTION 'Only patients and consultants can like posts.';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.blog_posts WHERE id = p_post_id AND status = 'published') THEN
    RAISE EXCEPTION 'Post not found or not published.';
  END IF;

  IF EXISTS (SELECT 1 FROM public.blog_post_likes WHERE post_id = p_post_id AND user_id = p_user_id) THEN
    DELETE FROM public.blog_post_likes WHERE post_id = p_post_id AND user_id = p_user_id;
    UPDATE public.blog_posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = p_post_id;
    v_liked := FALSE;
  ELSE
    INSERT INTO public.blog_post_likes (post_id, user_id) VALUES (p_post_id, p_user_id);
    UPDATE public.blog_posts SET like_count = like_count + 1 WHERE id = p_post_id;
    v_liked := TRUE;
  END IF;

  SELECT like_count INTO v_count FROM public.blog_posts WHERE id = p_post_id;
  RETURN json_build_object('liked', v_liked, 'likeCount', COALESCE(v_count, 0));
END;
$$;

REVOKE ALL ON FUNCTION public.toggle_blog_post_like(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.toggle_blog_post_like(UUID, UUID) TO authenticated;

-- Comment count refresh
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
       WHERE post_id = v_post_id AND deleted_at IS NULL
     )
   WHERE id = v_post_id;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_refresh_blog_comment_count ON public.blog_comments;
CREATE TRIGGER trg_refresh_blog_comment_count
  AFTER INSERT OR UPDATE OR DELETE ON public.blog_comments
  FOR EACH ROW EXECUTE PROCEDURE public.refresh_blog_comment_count();

-- Admin read all posts (including drafts) via admin policy above.
-- Admins preview drafts: add SELECT policy for admins on all statuses (covered by "Admins manage blog posts" FOR ALL which includes SELECT).

-- 2026-06-08: Threaded blog comments (replies via parent_id).
ALTER TABLE public.blog_comments
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.blog_comments(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS blog_comments_parent_id_idx
  ON public.blog_comments (parent_id)
  WHERE parent_id IS NOT NULL AND deleted_at IS NULL;
  