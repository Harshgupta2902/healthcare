-- Put incremental SQL updates here. After applying on Supabase,
-- fold these changes into SUPABASE_SETUP.sql for the next reference.

-- 2026-05-10: Newsletter unsubscribe — RPC-based status flip (HMAC token verified at app level).
-- SECURITY DEFINER bypasses RLS so we get a real row count back; safe because the function
-- is locked to a fixed status enum and a single column update.
CREATE OR REPLACE FUNCTION public.set_newsletter_status(p_email TEXT, p_status TEXT)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected INT;
BEGIN
  IF p_status NOT IN ('active', 'unsubscribed') THEN
    RAISE EXCEPTION 'Invalid newsletter status: %', p_status USING ERRCODE = '22023';
  END IF;
  IF p_email IS NULL OR length(trim(p_email)) = 0 THEN
    RAISE EXCEPTION 'Email is required' USING ERRCODE = '22023';
  END IF;

  UPDATE public.newsletter_subscribers
     SET status = p_status
   WHERE lower(email) = lower(trim(p_email));

  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$;

REVOKE ALL ON FUNCTION public.set_newsletter_status(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_newsletter_status(TEXT, TEXT) TO anon, authenticated;

-- 2026-05-10: Atomic subscribe — handles new subscribe, resubscribe (unsubscribed -> resubscribed),
-- and reports already_active so the action can show the right toast/error.
-- Status values:
--   'active'        first-time subscriber (welcome email sent)
--   'resubscribed'  came back after an unsubscribe (no welcome email re-sent)
--   'unsubscribed'  opted out
-- SECURITY DEFINER so we bypass the INSERT-only RLS for the resubscribe (UPDATE) path.
CREATE OR REPLACE FUNCTION public.subscribe_newsletter(p_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_normalized TEXT;
  v_existing_status TEXT;
BEGIN
  v_normalized := lower(trim(coalesce(p_email, '')));

  IF length(v_normalized) = 0 OR length(v_normalized) > 320 THEN
    RAISE EXCEPTION 'Invalid email' USING ERRCODE = '22023';
  END IF;
  IF v_normalized !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email' USING ERRCODE = '22023';
  END IF;

  SELECT status
    INTO v_existing_status
    FROM public.newsletter_subscribers
   WHERE lower(email) = v_normalized
   LIMIT 1;

  IF v_existing_status IN ('active', 'resubscribed') THEN
    RETURN 'already_active';
  ELSIF v_existing_status = 'unsubscribed' THEN
    UPDATE public.newsletter_subscribers
       SET status = 'resubscribed',
           subscribed_at = NOW()
     WHERE lower(email) = v_normalized;
    RETURN 'resubscribed';
  ELSE
    INSERT INTO public.newsletter_subscribers (email, status, subscribed_at)
    VALUES (v_normalized, 'active', NOW());
    RETURN 'subscribed';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.subscribe_newsletter(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.subscribe_newsletter(TEXT) TO anon, authenticated;

-- 2026-05-10: Read newsletter status (used by /unsubscribe page to show the right UI on revisit).
-- SECURITY DEFINER so anon can read just the status of a verified-by-token email.
CREATE OR REPLACE FUNCTION public.get_newsletter_status(p_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status TEXT;
BEGIN
  IF p_email IS NULL OR length(trim(p_email)) = 0 THEN
    RETURN NULL;
  END IF;
  SELECT status
    INTO v_status
    FROM public.newsletter_subscribers
   WHERE lower(email) = lower(trim(p_email))
   LIMIT 1;
  RETURN v_status; -- NULL when email is not in the list
END;
$$;

REVOKE ALL ON FUNCTION public.get_newsletter_status(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_newsletter_status(TEXT) TO anon, authenticated;

-- (Legacy direct-UPDATE policy kept here as a fallback; safe to leave or drop.)
GRANT UPDATE (status) ON TABLE public.newsletter_subscribers TO anon, authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'newsletter_subscribers'
      AND policyname = 'Allow public newsletter status update'
  ) THEN
    CREATE POLICY "Allow public newsletter status update"
      ON public.newsletter_subscribers
      FOR UPDATE
      TO anon, authenticated
      USING (true)
      WITH CHECK (status IN ('active', 'unsubscribed', 'resubscribed'));
  END IF;
END$$;

-- 2026-05-10: If the policy already exists from an earlier migration, widen its WITH CHECK.
DROP POLICY IF EXISTS "Allow public newsletter status update" ON public.newsletter_subscribers;
CREATE POLICY "Allow public newsletter status update"
  ON public.newsletter_subscribers
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (status IN ('active', 'unsubscribed', 'resubscribed'));

-- 2026-05-10: Newsletter duplicate prevention — case-insensitive UNIQUE index on email.
-- Existing UNIQUE(email) is case-sensitive; this guarantees Foo@Bar.com and foo@bar.com
-- collide as duplicates even if any legacy rows weren't lowercased on insert.
CREATE UNIQUE INDEX IF NOT EXISTS newsletter_subscribers_email_lower_uidx
  ON public.newsletter_subscribers ((lower(email)));

-- 2026-05-08 (rev 2): Widen patient SELECT — match on guest email = account email for ALL rows (not only created_by null).
-- Fixes: two bookings same email (one created_by set, one null) but only one appeared on client dashboard.
DROP POLICY IF EXISTS "Select by matching account email if unclaimed" ON public.guest_appointments;
DROP POLICY IF EXISTS "Select guest bookings matching patient email" ON public.guest_appointments;
CREATE POLICY "Select guest bookings matching patient email"
  ON public.guest_appointments
  FOR SELECT
  TO authenticated
  USING (
    guest_appointments.email IS NOT NULL
    AND (SELECT u.email FROM public.users u WHERE u.id = auth.uid()) IS NOT NULL
    AND lower(btrim(guest_appointments.email)) = lower(btrim(
      (SELECT u.email FROM public.users u WHERE u.id = auth.uid())
    ))
  );

-- Optional one-time backfill (run manually in SQL editor if you already have orphan rows):
-- UPDATE public.guest_appointments ga
-- SET created_by = u.id
-- FROM public.users u
-- WHERE ga.created_by IS NULL
--   AND lower(btrim(ga.email)) = lower(btrim(u.email));

-- 2026-05-08: Guest appointment prescriptions (professional writes TinyMCE HTML; client views PDF).
ALTER TABLE public.guest_appointments
  ADD COLUMN IF NOT EXISTS prescription_html TEXT,
  ADD COLUMN IF NOT EXISTS prescription_updated_at TIMESTAMPTZ;

COMMENT ON COLUMN public.guest_appointments.prescription_html IS 'Rich HTML prescription written by assigned professional.';
COMMENT ON COLUMN public.guest_appointments.prescription_updated_at IS 'Timestamp when prescription_html was last updated.';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'guest_appointments' AND policyname = 'Professionals update own guest bookings'
  ) THEN
    CREATE POLICY "Professionals update own guest bookings"
      ON public.guest_appointments
      FOR UPDATE
      TO authenticated
      USING (
        professional_id IS NOT NULL
        AND professional_id = auth.uid()
      )
      WITH CHECK (
        professional_id IS NOT NULL
        AND professional_id = auth.uid()
      );
  END IF;
END$$;

-- 2026-05-08: Contact form messages — table + public INSERT + admin RLS (aligns with /contact and admin enquiries page).
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
GRANT INSERT ON TABLE public.contact_messages TO anon, authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'contact_messages' AND policyname = 'Allow public contact message insert'
  ) THEN
    CREATE POLICY "Allow public contact message insert"
      ON public.contact_messages
      FOR INSERT
      TO anon, authenticated
      WITH CHECK (
        email IS NOT NULL
        AND char_length(trim(email)) BETWEEN 3 AND 320
        AND subject IS NOT NULL
        AND char_length(trim(subject)) BETWEEN 3 AND 500
        AND message IS NOT NULL
        AND char_length(trim(message)) BETWEEN 10 AND 20000
      );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'contact_messages' AND policyname = 'Admins can manage all contact messages'
  ) THEN
    CREATE POLICY "Admins can manage all contact messages" ON public.contact_messages FOR ALL
    USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
  END IF;
END$$;

-- 2026-05-08: Professionals can read guest_appointments rows assigned to them (book-consultation ?cref=).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'guest_appointments' AND policyname = 'Professionals read guest bookings assigned to them'
  ) THEN
    CREATE POLICY "Professionals read guest bookings assigned to them"
      ON public.guest_appointments
      FOR SELECT
      TO authenticated
      USING (
        professional_id IS NOT NULL
        AND professional_id = auth.uid()
      );
  END IF;
END$$;

-- 2026-05-08: Newsletter footer signup — allow anon/authenticated INSERT (RLS); no broad SELECT for anon.
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
GRANT INSERT ON TABLE public.newsletter_subscribers TO anon, authenticated;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'newsletter_subscribers' AND policyname = 'Allow public newsletter signup'
  ) THEN
    CREATE POLICY "Allow public newsletter signup"
      ON public.newsletter_subscribers
      FOR INSERT
      TO anon, authenticated
      WITH CHECK (
        email IS NOT NULL
        AND char_length(email) <= 320
        AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
        AND coalesce(status, 'active') = 'active'
      );
  END IF;
END$$;

-- 2026-05-01: Split contact phone — E.164 country prefix + national digits (users.phone stays national only).
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS phone_country_code TEXT;
COMMENT ON COLUMN public.users.phone_country_code IS 'E.164 dial prefix, e.g. +91; national number stored in phone.';
COMMENT ON COLUMN public.users.phone IS 'National subscriber number (digits only), without country code.';

-- 2026-04-13: Storage bucket for professional qualification verification uploads (used by addQualification server action)
INSERT INTO storage.buckets (id, name, public)
VALUES ('qualifications', 'qualifications', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Public qualification files are viewable by everyone" ON storage.objects FOR SELECT USING (bucket_id = 'qualifications');
CREATE POLICY "Professionals can upload own qualification documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'qualifications' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Professionals can update own qualification documents" ON storage.objects FOR UPDATE USING (bucket_id = 'qualifications' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Professionals can delete own qualification documents" ON storage.objects FOR DELETE USING (bucket_id = 'qualifications' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 2026-04-13: Qualification document approval (NULL = in review, TRUE = approved, FALSE = rejected)
ALTER TABLE public.professional_qualifications
  ADD COLUMN IF NOT EXISTS document_approved BOOLEAN;
COMMENT ON COLUMN public.professional_qualifications.document_approved IS 'NULL pending review; TRUE show verification link; FALSE not approved';

-- Optional: mark existing rows with a document as already approved
-- UPDATE public.professional_qualifications SET document_approved = true WHERE document_url IS NOT NULL AND document_approved IS NULL;

-- 2026-04-13: Professional salutation (Dr., Mr., Mrs., etc.) for public display
ALTER TABLE public.professional_profiles
  ADD COLUMN IF NOT EXISTS name_title TEXT;
COMMENT ON COLUMN public.professional_profiles.name_title IS 'Salutation shown before legal name (e.g. Dr., Mr., Mrs.)';

-- 2026-04-30: Guest appointment → which professional was requested (book-consultation ?cref= decoded user id)
ALTER TABLE public.guest_appointments
  ADD COLUMN IF NOT EXISTS professional_id uuid null REFERENCES public.users (id);
COMMENT ON COLUMN public.guest_appointments.professional_id IS 'Professional (users.id) the patient requested when booking via consultant deeplink; null for generic bookings.';

-- 2026-04-30: Admin panel — list/update guest appointments (RLS)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'guest_appointments' AND policyname = 'Admins can manage all guest appointments'
  ) THEN
    CREATE POLICY "Admins can manage all guest appointments" ON public.guest_appointments FOR ALL
    USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
  END IF;
END$$;

-- 2026-02-03: Persisted Google Calendar template URL for guest appointment (admin “copy invite” flow)
ALTER TABLE public.guest_appointments
  ADD COLUMN IF NOT EXISTS calendar_invite_url TEXT;

COMMENT ON COLUMN public.guest_appointments.calendar_invite_url IS 'Pre-built calendar.google.com TEMPLATE link; shown as copy-only once set.';

-- 2026-02-02: Google Calendar OAuth tokens (per admin user) + Meet event audit log
CREATE TABLE IF NOT EXISTS public.google_calendar_connections (
  user_id UUID PRIMARY KEY REFERENCES public.users (id) ON DELETE CASCADE,
  refresh_token TEXT NOT NULL,
  access_token TEXT,
  token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.google_meet_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  google_event_id TEXT NOT NULL,
  meet_link TEXT NOT NULL,
  html_link TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  attendee_emails TEXT[] NOT NULL DEFAULT '{}',
  guest_appointment_ids UUID[] NOT NULL DEFAULT '{}',
  summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.google_calendar_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_meet_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'google_calendar_connections' AND policyname = 'Admins store own Google calendar tokens'
  ) THEN
    CREATE POLICY "Admins store own Google calendar tokens" ON public.google_calendar_connections FOR ALL TO authenticated
    USING (
      auth.uid() = user_id
      AND (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    )
    WITH CHECK (
      auth.uid() = user_id
      AND (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'google_meet_events' AND policyname = 'Admins can manage all google meet events'
  ) THEN
    CREATE POLICY "Admins can manage all google meet events" ON public.google_meet_events FOR ALL TO authenticated
    USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin')
    WITH CHECK ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
  END IF;
END$$;

-- 2026-05-01: Admin notifications (activity feed for admins)
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  actor_user_id UUID REFERENCES public.users (id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  read_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at ON public.admin_notifications (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_unread ON public.admin_notifications (created_at DESC) WHERE read_at IS NULL;

ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON public.admin_notifications TO authenticated;
GRANT ALL ON public.admin_notifications TO service_role;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'admin_notifications' AND policyname = 'Admins can read notifications'
  ) THEN
    CREATE POLICY "Admins can read notifications" ON public.admin_notifications FOR SELECT TO authenticated
    USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'admin_notifications' AND policyname = 'Admins can update notifications'
  ) THEN
    CREATE POLICY "Admins can update notifications" ON public.admin_notifications FOR UPDATE TO authenticated
    USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin')
    WITH CHECK ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'admin_notifications' AND policyname = 'Users insert own admin notification rows'
  ) THEN
    CREATE POLICY "Users insert own admin notification rows" ON public.admin_notifications FOR INSERT TO authenticated
    WITH CHECK (actor_user_id IS NOT NULL AND actor_user_id = auth.uid());
  END IF;
END$$;

CREATE OR REPLACE FUNCTION public.admin_notify_on_user_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role = 'admin' THEN
    RETURN NEW;
  END IF;
  INSERT INTO public.admin_notifications (type, title, body, actor_user_id, metadata)
  VALUES (
    'user.registered',
    'New user registered',
    concat(NEW.name, ' (', NEW.role, ')'),
    NEW.id,
    jsonb_build_object('user_id', NEW.id, 'email', NEW.email, 'role', NEW.role)
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_admin_notify_new_user ON public.users;
CREATE TRIGGER trg_admin_notify_new_user
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.admin_notify_on_user_insert();

CREATE OR REPLACE FUNCTION public.admin_notify_on_guest_appointment_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_notifications (type, title, body, actor_user_id, metadata)
  VALUES (
    'guest.appointment_request',
    'Guest consultation request',
    concat(trim(NEW.first_name), ' ', trim(NEW.last_name), ' — ', to_char(NEW.appointment_date, 'YYYY-MM-DD'), ' ', NEW.appointment_time),
    NEW.created_by,
    jsonb_build_object(
      'guest_appointment_id', NEW.id,
      'email', NEW.email,
      'city', NEW.city,
      'state', NEW.state,
      'category', NEW.category,
      'professional_id', NEW.professional_id
    )
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_admin_notify_guest_appointment ON public.guest_appointments;
CREATE TRIGGER trg_admin_notify_guest_appointment
  AFTER INSERT ON public.guest_appointments
  FOR EACH ROW
  EXECUTE PROCEDURE public.admin_notify_on_guest_appointment_insert();