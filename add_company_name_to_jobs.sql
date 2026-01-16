-- Add company_name to jobs table to allow Admin overrides
ALTER TABLE public.jobs
ADD COLUMN company_name TEXT;

-- Update RLS to ensure Admins can insert/update jobs
-- Existing policy: "Recruiters can manage their own jobs." -> recruiter_id = auth.uid() OR role = 'ADMIN'
-- This should already cover Admins, but let's double check.
-- The existing policy in schema.sql was:
-- CREATE POLICY "Recruiters can manage their own jobs." ON public.jobs
-- FOR ALL USING (recruiter_id = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN');

-- So RLS is fine.
