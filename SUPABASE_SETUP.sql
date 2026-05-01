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
  created_at timestamptz not null default now(),
  created_by uuid null,
  professional_id uuid null
);
comment on column public.guest_appointments.professional_id is 'Professional (public.users.id) requested via consultant deeplink (?cref); null for generic bookings.';
comment on column public.guest_appointments.calendar_invite_url is 'Google Calendar TEMPLATE link generated in admin; copy-only after set.';

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
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 🛡️ 4. EXTRAS & TRIGGERS
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'active'
);

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
