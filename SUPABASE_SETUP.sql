-- Base schema setup for guest appointments
-- Run once when initializing the project. Subsequent changes go to updates.sql

-- Create table: guest_appointments
create table if not exists public.guest_appointments (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  age integer not null check (age >= 0 and age <= 120),
  phone text not null,
  email text not null,
  category text not null,
  state text not null,
  city text not null,
  appointment_date date not null,
  appointment_time text not null,
  message text,
  calendar_invite_url text,
  prescription_html text,
  prescription_updated_at timestamptz,
  created_at timestamptz not null default now(),
  created_by uuid null,
  professional_id uuid null
);
comment on column public.guest_appointments.professional_id is 'Professional (public.users.id) requested via consultant deeplink (?cref); null for generic bookings.';
comment on column public.guest_appointments.calendar_invite_url is 'Video meeting URL (Google Meet or Jitsi); set when admin creates meeting and sends invites.';
comment on column public.guest_appointments.prescription_html is 'Rich HTML prescription written by assigned professional.';
comment on column public.guest_appointments.prescription_updated_at is 'Timestamp when prescription_html was last updated.';

-- RLS
alter table public.guest_appointments enable row level security;

-- Policies:
-- 1) Allow anyone to insert a guest appointment (no auth required)
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'guest_appointments' and policyname = 'Allow insert for all'
  ) then
    create policy "Allow insert for all"
      on public.guest_appointments
      for insert
      to anon, authenticated
      with check (true);
  end if;
end$$;

-- 2) By default, no select for anonymous. Authenticated users can read only their own rows if created_by is set.
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'guest_appointments' and policyname = 'Select own'
  ) then
    create policy "Select own"
      on public.guest_appointments
      for select
      to authenticated
      using (created_by = auth.uid());
  end if;
end$$;

-- 2b) Patient dashboard: also allow SELECT when guest row email matches account email (not only when created_by is null).
--     So all bookings for harsh.ixora@gmail.com show for that user, including one row with created_by set and one orphan row.
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'guest_appointments' and policyname = 'Select guest bookings matching patient email'
  ) then
    create policy "Select guest bookings matching patient email"
      on public.guest_appointments
      for select
      to authenticated
      using (
        guest_appointments.email is not null
        and (select u.email from public.users u where u.id = auth.uid()) is not null
        and lower(btrim(guest_appointments.email)) = lower(btrim(
          (select u.email from public.users u where u.id = auth.uid())
        ))
      );
  end if;
end$$;

-- 3) Professional sees guest bookings where they are the requested consultant (?cref=)
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'guest_appointments' and policyname = 'Professionals read guest bookings assigned to them'
  ) then
    create policy "Professionals read guest bookings assigned to them"
      on public.guest_appointments
      for select
      to authenticated
      using (
        professional_id is not null
        and professional_id = auth.uid()
      );
  end if;
end$$;

-- 4) Assigned professional can update prescription fields on own guest bookings
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'guest_appointments' and policyname = 'Professionals update own guest bookings'
  ) then
    create policy "Professionals update own guest bookings"
      on public.guest_appointments
      for update
      to authenticated
      using (
        professional_id is not null
        and professional_id = auth.uid()
      )
      with check (
        professional_id is not null
        and professional_id = auth.uid()
      );
  end if;
end$$;

-- RPC: booking success page reads appointment by id (anon + authenticated; UUID is unguessable).
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

-- SUPABASE SETUP SCRIPT (Renamed profiles to users)
-- Copy and paste this into the Supabase SQL Editor

-- 🛡️ 0. ENABLE EXTENSIONS
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 🛡️ 1. CORE AUTH & USERS (Renamed from profiles)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  image TEXT,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'professional', 'admin')),
  phone TEXT,
  phone_country_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 🛡️ 2. MEDICAL & DASHBOARD TABLES
CREATE TABLE IF NOT EXISTS public.client_medical_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  date_of_birth TEXT,
  gender TEXT,
  blood_type TEXT,
  height TEXT,
  weight TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.medical_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  condition_name TEXT NOT NULL,
  diagnosis_date TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  prescribing_doctor TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.medical_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  document_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INT,
  upload_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 🛡️ 3. PROFESSIONAL & SCHEDULING
CREATE TABLE IF NOT EXISTS public.professional_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  specialization TEXT NOT NULL,
  license_number TEXT NOT NULL,
  bio TEXT,
  name_title TEXT,
  years_of_experience INT,
  consultation_fee INT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.professional_qualifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  degree TEXT NOT NULL,
  institution TEXT NOT NULL,
  year INT,
  document_url TEXT,
  -- NULL = pending admin review; TRUE = verified (show document link); FALSE = not approved
  document_approved BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  appointment_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  notes TEXT,
  meeting_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.professional_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT professional_availability_day_of_week_check CHECK (day_of_week >= 0 AND day_of_week <= 6)
);

CREATE UNIQUE INDEX IF NOT EXISTS professional_availability_professional_day_unique
  ON public.professional_availability (professional_id, day_of_week);

-- 🛡️ 4. EXTRAS & TRIGGERS
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'active'
);

-- Case-insensitive duplicate guard (Foo@Bar.com == foo@bar.com).
CREATE UNIQUE INDEX IF NOT EXISTS newsletter_subscribers_email_lower_uidx
  ON public.newsletter_subscribers ((lower(email)));

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
GRANT INSERT ON TABLE public.newsletter_subscribers TO anon, authenticated;
-- Anon/authenticated may only flip the `status` column (used by /unsubscribe page with HMAC token).
GRANT UPDATE (status) ON TABLE public.newsletter_subscribers TO anon, authenticated;

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

  -- Newsletter unsubscribe / resubscribe (HMAC-signed tokens checked at app level).
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'newsletter_subscribers' AND policyname = 'Allow public newsletter status update'
  ) THEN
    CREATE POLICY "Allow public newsletter status update"
      ON public.newsletter_subscribers
      FOR UPDATE
      TO anon, authenticated
      USING (true)
      WITH CHECK (status IN ('active', 'unsubscribed', 'resubscribed'));
  END IF;
END$$;

-- Newsletter campaign archive (subject + HTML body) and per-recipient delivery rows.
-- Recipients are stored as INT[] of newsletter_subscribers.id; emails are looked up at render time.
CREATE TABLE IF NOT EXISTS public.newsletter_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  sent_by UUID NULL REFERENCES public.users (id) ON DELETE SET NULL,
  recipient_ids INT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_created_at
  ON public.newsletter_campaigns (created_at DESC);

ALTER TABLE public.newsletter_campaigns ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'newsletter_campaigns'
      AND policyname = 'Admins manage all newsletter campaigns'
  ) THEN
    CREATE POLICY "Admins manage all newsletter campaigns"
      ON public.newsletter_campaigns FOR ALL TO authenticated
      USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin')
      WITH CHECK ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
  END IF;
END$$;

-- RPC used by /unsubscribe page (SECURITY DEFINER returns row count, bypasses RLS quirks).
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

-- Atomic subscribe RPC: returns 'subscribed' | 'resubscribed' | 'already_active'.
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

-- Read current newsletter status (used by /unsubscribe page to render the right UI on revisit).
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
  RETURN v_status;
END;
$$;

REVOKE ALL ON FUNCTION public.get_newsletter_status(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_newsletter_status(TEXT) TO anon, authenticated;

-- Newsletter signup rate limits (IP / email / device buckets). No direct table access for clients.
CREATE TABLE IF NOT EXISTS public.newsletter_rate_limits (
  bucket_key TEXT PRIMARY KEY,
  attempt_count INT NOT NULL DEFAULT 0,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.newsletter_rate_limits ENABLE ROW LEVEL SECURITY;

-- Returns TRUE when the attempt is allowed (and counted), FALSE when the window limit is exceeded.
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

-- Public contact form submissions (admin reads in /application/enter/enquiries)
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

CREATE TABLE IF NOT EXISTS public.insurance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  provider_name TEXT NOT NULL,
  policy_number TEXT NOT NULL,
  group_number TEXT,
  policy_holder_name TEXT NOT NULL,
  relationship_to_holder TEXT,
  expiration_date TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.google_calendar_connections (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  refresh_token TEXT NOT NULL,
  access_token TEXT,
  token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.google_meet_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_medical_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_calendar_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_meet_events ENABLE ROW LEVEL SECURITY;

-- Auth Sync Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role, image)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    NEW.raw_user_meta_data->>'image'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove duplicate trigger check
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 🔐 Permission Grants
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON TABLE public.users TO authenticated;
GRANT ALL ON TABLE public.users TO service_role;
GRANT ALL ON TABLE public.users TO postgres;

-- Policies
CREATE POLICY "Public users are viewable by everyone" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own record" ON public.users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can view own medical info" ON public.client_medical_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own history" ON public.medical_history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own medications" ON public.medications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own documents" ON public.medical_documents FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own insurance" ON public.insurance FOR ALL USING (auth.uid() = user_id);

-- Professional Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.professional_profiles FOR SELECT USING (true);
CREATE POLICY "Professionals can manage own profile" ON public.professional_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public qualifications are viewable by everyone" ON public.professional_qualifications FOR SELECT USING (true);
CREATE POLICY "Professionals can manage own qualifications" ON public.professional_qualifications FOR ALL USING (auth.uid() = professional_id);
CREATE POLICY "Public availability is viewable by everyone" ON public.professional_availability FOR SELECT USING (true);
CREATE POLICY "Professionals can manage own availability" ON public.professional_availability FOR ALL USING (auth.uid() = professional_id);
CREATE POLICY "Users can view own appointments" ON public.appointments FOR ALL USING (auth.uid() = client_id OR auth.uid() = professional_id);

-- 🔐 Admin RLS Policies - Allow admins to manage all data
DO $$ 
BEGIN
    -- Users table
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Admins can manage all users') THEN
        CREATE POLICY "Admins can manage all users" ON public.users FOR ALL 
        USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
    END IF;

    -- Client Medical Profiles
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'client_medical_profiles' AND policyname = 'Admins can manage all medical profiles') THEN
        CREATE POLICY "Admins can manage all medical profiles" ON public.client_medical_profiles FOR ALL 
        USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
    END IF;

    -- Medical History
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'medical_history' AND policyname = 'Admins can manage all medical history') THEN
        CREATE POLICY "Admins can manage all medical history" ON public.medical_history FOR ALL 
        USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
    END IF;

    -- Medications
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'medications' AND policyname = 'Admins can manage all medications') THEN
        CREATE POLICY "Admins can manage all medications" ON public.medications FOR ALL 
        USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
    END IF;

    -- Medical Documents
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'medical_documents' AND policyname = 'Admins can manage all documents') THEN
        CREATE POLICY "Admins can manage all documents" ON public.medical_documents FOR ALL 
        USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
    END IF;

    -- Professional Profiles
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'professional_profiles' AND policyname = 'Admins can manage all professional profiles') THEN
        CREATE POLICY "Admins can manage all professional profiles" ON public.professional_profiles FOR ALL 
        USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
    END IF;

    -- Professional Qualifications
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'professional_qualifications' AND policyname = 'Admins can manage all qualifications') THEN
        CREATE POLICY "Admins can manage all qualifications" ON public.professional_qualifications FOR ALL 
        USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
    END IF;

    -- Professional Availability
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'professional_availability' AND policyname = 'Admins can manage all availability') THEN
        CREATE POLICY "Admins can manage all availability" ON public.professional_availability FOR ALL 
        USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
    END IF;

    -- Appointments
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'appointments' AND policyname = 'Admins can manage all appointments') THEN
        CREATE POLICY "Admins can manage all appointments" ON public.appointments FOR ALL 
        USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
    END IF;

    -- Insurance
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'insurance' AND policyname = 'Admins can manage all insurance') THEN
        CREATE POLICY "Admins can manage all insurance" ON public.insurance FOR ALL 
        USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
    END IF;

    -- Newsletter Subscribers
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'newsletter_subscribers' AND policyname = 'Admins can manage all subscribers') THEN
        CREATE POLICY "Admins can manage all subscribers" ON public.newsletter_subscribers FOR ALL 
        USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
    END IF;

    -- Contact messages (site contact form)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contact_messages' AND policyname = 'Admins can manage all contact messages') THEN
        CREATE POLICY "Admins can manage all contact messages" ON public.contact_messages FOR ALL
        USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
    END IF;

    -- Guest appointments (public booking requests)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'guest_appointments' AND policyname = 'Admins can manage all guest appointments') THEN
        CREATE POLICY "Admins can manage all guest appointments" ON public.guest_appointments FOR ALL
        USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
    END IF;

    -- Google Calendar OAuth (admin connects own account)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'google_calendar_connections' AND policyname = 'Admins store own Google calendar tokens') THEN
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

    -- Google Meet events audit log
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'google_meet_events' AND policyname = 'Admins can manage all google meet events') THEN
        CREATE POLICY "Admins can manage all google meet events" ON public.google_meet_events FOR ALL TO authenticated
        USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin')
        WITH CHECK ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
    END IF;
END $$;

-- Admin activity notifications (see updates.sql for incremental apply)
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

-- Newsletter activity → admin notifications.
-- Fires on subscriber insert or status change (subscribe / unsubscribe / resubscribe / reactivate).
-- actor_user_id resolves to auth.uid() when an authenticated user (e.g. admin via the Ban icon)
-- triggers the change; NULL for anonymous footer signups and email unsubscribe link clicks.
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

-- 🌱 FULL SEED DATA
DO $$ 
DECLARE 
  test_user_id UUID := '00000000-0000-0000-0000-000000000001';
  pro_user_id UUID := '11111111-1111-1111-1111-111111111111';
BEGIN
  -- 1. Create Test Client in AUTH (This triggers user table creation automatically)
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role)
  VALUES (
    test_user_id, 
    'test@example.com', 
    crypt('password123', gen_salt('bf')), 
    now(), 
    '{"provider":"email","providers":["email"]}', 
    '{"name":"Test Patient","role":"client"}', 
    'authenticated', 
    'authenticated'
  ) ON CONFLICT (id) DO NOTHING;

  -- 2. Create Test Professional in AUTH
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role)
  VALUES (
    pro_user_id, 
    'emily@hospital.com', 
    crypt('password123', gen_salt('bf')), 
    now(), 
    '{"provider":"email","providers":["email"]}', 
    '{"name":"Dr. Emily Roberts","role":"professional"}', 
    'authenticated', 
    'authenticated'
  ) ON CONFLICT (id) DO NOTHING;

  -- 3. Update Users with optional info
  UPDATE public.users SET phone = '+1-555-0123' WHERE id = test_user_id;

  -- 4. User Profiles
  INSERT INTO public.client_medical_profiles (user_id, date_of_birth, gender, blood_type, height, weight, address, city, state, postal_code, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship)
  VALUES (test_user_id, '1985-06-15', 'Male', 'O+', '175', '75', '123 Main Street, Apt 4B', 'San Francisco', 'California', '94102', 'Sarah Johnson', '+1-555-0199', 'Spouse')
  ON CONFLICT (user_id) DO NOTHING;

  -- 5. Medical History
  INSERT INTO public.medical_history (user_id, condition_name, diagnosis_date, status, notes)
  VALUES 
    (test_user_id, 'Hypertension', '2020-03-15', 'chronic', 'Stage 1 hypertension, controlled with medication'),
    (test_user_id, 'Seasonal Allergies', '2018-05-22', 'active', 'Allergic to pollen and dust mites'),
    (test_user_id, 'Ankle Sprain (Left)', '2022-08-10', 'resolved', 'Grade 2 sprain from sports injury')
  ON CONFLICT DO NOTHING;

  -- 6. Medications
  INSERT INTO public.medications (user_id, medication_name, dosage, frequency, start_date, end_date, prescribing_doctor, notes, is_active)
  VALUES 
    (test_user_id, 'Lisinopril', '10 mg', 'Once daily', '2020-03-20', NULL, 'Dr. Emily Roberts, MD', 'Take in the morning with food', true),
    (test_user_id, 'Cetirizine (Zyrtec)', '10 mg', 'Once daily', '2023-03-01', NULL, 'Dr. Michael Chen, MD', 'Take before bedtime', true),
    (test_user_id, 'Vitamin D3', '2000 IU', 'Once daily', '2022-11-15', NULL, 'Dr. Emily Roberts, MD', 'Take with a meal', true),
    (test_user_id, 'Ibuprofen', '400 mg', 'Three times daily', '2022-08-10', '2022-09-30', 'Dr. Sarah Martinez, PT', 'Used during ankle sprain recovery', false)
  ON CONFLICT DO NOTHING;

  -- 7. Medical Documents
  INSERT INTO public.medical_documents (user_id, document_name, document_type, file_url, file_size, notes)
  VALUES 
    (test_user_id, 'Annual Blood Work Results 2024', 'report', 'https://example.com/documents/blood-test-2024.pdf', 245678, 'Complete blood count and lipid panel'),
    (test_user_id, 'Lisinopril Prescription Renewal', 'prescription', 'https://example.com/documents/prescription-lisinopril.pdf', 89234, '90-day supply prescription'),
    (test_user_id, 'Left Ankle X-Ray', 'xray', 'https://example.com/documents/ankle-xray-2022.jpg', 1456789, 'No fractures detected, confirmed grade 2 sprain')
  ON CONFLICT DO NOTHING;

  -- 8. Professional Profile Details
  INSERT INTO public.professional_profiles (user_id, specialization, license_number, years_of_experience, consultation_fee, is_verified)
  VALUES (pro_user_id, 'Cardiologist', 'MD-992288', 12, 15000, true)
  ON CONFLICT (user_id) DO NOTHING;

  -- 9. Create Admin User
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role)
  VALUES (
    '22222222-2222-2222-2222-222222222222',
    'admin@healthcare.com',
    crypt('admin123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Admin User","role":"admin"}',
    'authenticated',
    'authenticated'
  ) ON CONFLICT (id) DO NOTHING;

  -- Update admin role in public.users
  UPDATE public.users SET role = 'admin' WHERE email = 'admin@healthcare.com';

END $$;

-- 📦 5. STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('medical-documents', 'medical-documents', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 🔐 STORAGE POLICIES
-- Profiles Bucket
CREATE POLICY "Public Profiles are viewable by everyone" ON storage.objects FOR SELECT USING (bucket_id = 'profiles');
CREATE POLICY "Users can upload their own profile image" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'profiles' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own profile image" ON storage.objects FOR UPDATE USING (bucket_id = 'profiles' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own profile image" ON storage.objects FOR DELETE USING (bucket_id = 'profiles' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Medical Documents Bucket
CREATE POLICY "Public Medical Documents are viewable by everyone" ON storage.objects FOR SELECT USING (bucket_id = 'medical-documents');
CREATE POLICY "Users can view own medical documents" ON storage.objects FOR SELECT USING (bucket_id = 'medical-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can upload own medical documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'medical-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own medical documents" ON storage.objects FOR DELETE USING (bucket_id = 'medical-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

INSERT INTO storage.buckets (id, name, public)
VALUES ('qualifications', 'qualifications', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Qualifications (professional degrees / certification documents)
CREATE POLICY "Public qualification files are viewable by everyone" ON storage.objects FOR SELECT USING (bucket_id = 'qualifications');
CREATE POLICY "Professionals can upload own qualification documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'qualifications' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Professionals can update own qualification documents" ON storage.objects FOR UPDATE USING (bucket_id = 'qualifications' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Professionals can delete own qualification documents" ON storage.objects FOR DELETE USING (bucket_id = 'qualifications' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 📰 BLOG CMS (categories, posts, comments, likes, views)
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
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  meta_title TEXT,
  meta_description TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  view_count BIGINT NOT NULL DEFAULT 0,
  like_count BIGINT NOT NULL DEFAULT 0,
  comment_count BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT blog_posts_published_requires_category CHECK (
    status NOT IN ('published', 'pending_review') OR category_id IS NOT NULL
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
  parent_id UUID REFERENCES public.blog_comments(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS blog_comments_post_created_idx
  ON public.blog_comments (post_id, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS blog_comments_parent_id_idx
  ON public.blog_comments (parent_id)
  WHERE parent_id IS NOT NULL AND deleted_at IS NULL;

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
GRANT INSERT, UPDATE ON public.blog_posts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_comments TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.blog_post_likes TO authenticated;

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
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'blog_posts' AND policyname = 'Authors read own blog posts') THEN
    CREATE POLICY "Authors read own blog posts" ON public.blog_posts FOR SELECT TO authenticated
    USING (
      author_id = auth.uid()
      AND (SELECT role FROM public.users WHERE id = auth.uid()) IN ('client', 'professional')
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'blog_posts' AND policyname = 'Authors insert own blog posts') THEN
    CREATE POLICY "Authors insert own blog posts" ON public.blog_posts FOR INSERT TO authenticated
    WITH CHECK (
      author_id = auth.uid()
      AND (SELECT role FROM public.users WHERE id = auth.uid()) IN ('client', 'professional')
      AND status IN ('draft', 'pending_review')
      AND published_at IS NULL
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'blog_posts' AND policyname = 'Authors update own blog posts') THEN
    CREATE POLICY "Authors update own blog posts" ON public.blog_posts FOR UPDATE TO authenticated
    USING (
      author_id = auth.uid()
      AND (SELECT role FROM public.users WHERE id = auth.uid()) IN ('client', 'professional')
      AND status IN ('draft', 'pending_review')
    )
    WITH CHECK (
      author_id = auth.uid()
      AND (SELECT role FROM public.users WHERE id = auth.uid()) IN ('client', 'professional')
      AND status IN ('draft', 'pending_review')
      AND published_at IS NULL
    );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'blog_comments' AND policyname = 'Read approved comments on published posts') THEN
    CREATE POLICY "Read approved comments on published posts" ON public.blog_comments FOR SELECT TO anon, authenticated
    USING (
      deleted_at IS NULL
      AND status = 'approved'
      AND EXISTS (SELECT 1 FROM public.blog_posts p WHERE p.id = post_id AND p.status = 'published')
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'blog_comments' AND policyname = 'Users read own pending comments') THEN
    CREATE POLICY "Users read own pending comments" ON public.blog_comments FOR SELECT TO authenticated
    USING (
      user_id = auth.uid()
      AND status = 'pending'
      AND deleted_at IS NULL
      AND EXISTS (SELECT 1 FROM public.blog_posts p WHERE p.id = post_id AND p.status = 'published')
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'blog_comments' AND policyname = 'Engagement users insert comments') THEN
    CREATE POLICY "Engagement users insert comments" ON public.blog_comments FOR INSERT TO authenticated
    WITH CHECK (
      user_id = auth.uid()
      AND status = 'pending'
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

DROP TRIGGER IF EXISTS trg_refresh_blog_comment_count ON public.blog_comments;
CREATE TRIGGER trg_refresh_blog_comment_count
  AFTER INSERT OR UPDATE OR DELETE ON public.blog_comments
  FOR EACH ROW EXECUTE PROCEDURE public.refresh_blog_comment_count();

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

DROP TRIGGER IF EXISTS trg_blog_posts_enforce_publish_rules ON public.blog_posts;
CREATE TRIGGER trg_blog_posts_enforce_publish_rules
  BEFORE INSERT OR UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE PROCEDURE public.blog_posts_enforce_publish_rules();
