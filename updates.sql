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
