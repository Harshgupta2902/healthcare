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
