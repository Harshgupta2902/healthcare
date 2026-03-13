-- 👤 Create Admin User
-- Insert admin user into auth.users
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  aud,
  role
)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'admin@healthcare.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  '{"name":"Admin User","role":"admin"}',
  'authenticated',
  'authenticated'
)
ON CONFLICT (id) DO NOTHING;

-- Update role in public.users table
UPDATE public.users
SET role = 'admin'
WHERE email = 'admin@healthcare.com';

-- If user doesn't exist in public.users, insert it
INSERT INTO public.users (id, name, email, role)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'Admin User',
  'admin@healthcare.com',
  'admin'
)
ON CONFLICT (id) DO UPDATE SET role = 'admin';

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

    -- Newsletter Subscribers (no RLS by default, but adding for consistency)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'newsletter_subscribers' AND policyname = 'Admins can manage all subscribers') THEN
        CREATE POLICY "Admins can manage all subscribers" ON public.newsletter_subscribers FOR ALL 
        USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
    END IF;
END $$;