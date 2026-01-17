-- Add education and work_experience columns to candidate_profiles table
-- These fields are used in the candidate profile form as JSON arrays

ALTER TABLE public.candidate_profiles
ADD COLUMN IF NOT EXISTS education JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS work_experience JSONB DEFAULT '[]'::jsonb;
