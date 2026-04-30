-- Put incremental SQL updates here. After applying on Supabase,
-- fold these changes into SUPABASE_SETUP.sql for the next reference.

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