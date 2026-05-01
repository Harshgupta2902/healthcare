-- Put incremental SQL updates here. After applying on Supabase,
-- fold these changes into SUPABASE_SETUP.sql for the next reference.

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