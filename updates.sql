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