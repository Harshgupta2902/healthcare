-- 🛡️ Update insurance table schema and security
ALTER TABLE public.insurance ADD COLUMN IF NOT EXISTS notes TEXT;

-- Enable RLS for all tables (if missing)
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

-- 🔐 Corrected Security Policies (using proper professional_id/client_id columns)
DO $$ 
BEGIN
    -- Insurance
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'insurance' AND policyname = 'Users can manage own insurance') THEN
        CREATE POLICY "Users can manage own insurance" ON public.insurance FOR ALL USING (auth.uid() = user_id);
    END IF;
    
    -- Professional Profile
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'professional_profiles' AND policyname = 'Public profiles are viewable by everyone') THEN
        CREATE POLICY "Public profiles are viewable by everyone" ON public.professional_profiles FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'professional_profiles' AND policyname = 'Professionals can manage own profile') THEN
        CREATE POLICY "Professionals can manage own profile" ON public.professional_profiles FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Professional Qualifications (USES professional_id)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'professional_qualifications' AND policyname = 'Public qualifications are viewable by everyone') THEN
        CREATE POLICY "Public qualifications are viewable by everyone" ON public.professional_qualifications FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'professional_qualifications' AND policyname = 'Professionals can manage own qualifications') THEN
        CREATE POLICY "Professionals can manage own qualifications" ON public.professional_qualifications FOR ALL USING (auth.uid() = professional_id);
    END IF;

    -- Professional Availability (USES professional_id)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'professional_availability' AND policyname = 'Public availability is viewable by everyone') THEN
        CREATE POLICY "Public availability is viewable by everyone" ON public.professional_availability FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'professional_availability' AND policyname = 'Professionals can manage own availability') THEN
        CREATE POLICY "Professionals can manage own availability" ON public.professional_availability FOR ALL USING (auth.uid() = professional_id);
    END IF;

    -- Appointments (USES client_id/professional_id)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'appointments' AND policyname = 'Users can view own appointments') THEN
        CREATE POLICY "Users can view own appointments" ON public.appointments FOR ALL USING (auth.uid() = client_id OR auth.uid() = professional_id);
    END IF;
END $$;

-- 🏙️ Add city column to professional profiles
ALTER TABLE public.professional_profiles ADD COLUMN IF NOT EXISTS city TEXT;
