-- TALENT HUB SUPABASE SCHEMA
-- This SQL should be run in the Supabase SQL Editor

-- 1. ENUMS AND TYPES
CREATE TYPE app_role AS ENUM ('CANDIDATE', 'RECRUITER', 'ADMIN');

-- 2. TABLES

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'CANDIDATE',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Candidate profiles (extended info)
CREATE TABLE public.candidate_profiles (
  id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  resume_url TEXT,
  linkedin_url TEXT,
  skills TEXT[],
  bio TEXT,
  location TEXT DEFAULT 'Lusaka, Zambia',
  phone_number TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recruiter profiles (extended info)
CREATE TABLE public.recruiter_profiles (
  id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  company_name TEXT NOT NULL,
  company_website TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  is_suspended BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs
CREATE TABLE public.jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recruiter_id UUID REFERENCES public.profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT NOT NULL,
  location TEXT DEFAULT 'Lusaka, Zambia',
  salary_range TEXT,
  job_type TEXT DEFAULT 'Full-time',
  industry TEXT, -- New field
  status TEXT DEFAULT 'published', -- published, drafted, closed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job screening questions
CREATE TABLE public.job_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  is_required BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Applications
CREATE TABLE public.applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  candidate_id UUID REFERENCES public.profiles(id) NOT NULL,
  resume_url TEXT, -- per-application resume (optional)
  status TEXT DEFAULT 'pending', -- pending, shortlisted, rejected, hired
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, candidate_id) -- Prevent duplicate applications
);

-- Application answers
CREATE TABLE public.application_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.job_questions(id) ON DELETE CASCADE NOT NULL,
  answer_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved Jobs
CREATE TABLE public.saved_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(candidate_id, job_id)
);

-- 3. RLS POLICIES

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_answers ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Candidate Profiles Policies
CREATE POLICY "Candidate profiles viewable by owner and recruiters of applied jobs." ON public.candidate_profiles
  FOR SELECT USING (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM public.applications a
      JOIN public.jobs j ON a.job_id = j.id
      WHERE a.candidate_id = public.candidate_profiles.id AND j.recruiter_id = auth.uid()
    ) OR
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN'
  );

CREATE POLICY "Candidates can update own profile." ON public.candidate_profiles
  FOR ALL USING (auth.uid() = id);

-- Recruiter Profiles Policies
CREATE POLICY "Recruiter profiles viewable by everyone." ON public.recruiter_profiles
  FOR SELECT USING (true);

CREATE POLICY "Recruiters can update own profile." ON public.recruiter_profiles
  FOR ALL USING (auth.uid() = id);

-- Jobs Policies
CREATE POLICY "Published jobs are viewable by everyone." ON public.jobs
  FOR SELECT USING (status = 'published' OR recruiter_id = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN');

CREATE POLICY "Recruiters can manage their own jobs." ON public.jobs
  FOR ALL USING (recruiter_id = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN');

-- Job Questions Policies
CREATE POLICY "Questions are viewable if job is viewable." ON public.job_questions
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.jobs WHERE id = public.job_questions.job_id));

CREATE POLICY "Recruiters can manage questions for their jobs." ON public.job_questions
  FOR ALL USING (EXISTS (SELECT 1 FROM public.jobs WHERE id = public.job_questions.job_id AND recruiter_id = auth.uid()) OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN');

-- Applications Policies
CREATE POLICY "Candidates can view their own applications." ON public.applications
  FOR SELECT USING (candidate_id = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN');

CREATE POLICY "Recruiters can view applications for their jobs." ON public.applications
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.jobs WHERE id = public.applications.job_id AND recruiter_id = auth.uid()));

CREATE POLICY "Candidates can apply to jobs." ON public.applications
  FOR INSERT WITH CHECK (auth.uid() = candidate_id);

CREATE POLICY "Recruiters can update application status." ON public.applications
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.jobs WHERE id = public.applications.job_id AND recruiter_id = auth.uid()) OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN');

-- Application Answers Policies
CREATE POLICY "Answers are viewable if application is viewable." ON public.application_answers
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.applications WHERE id = public.application_answers.application_id AND (candidate_id = auth.uid() OR EXISTS (SELECT 1 FROM public.jobs WHERE id = public.applications.job_id AND recruiter_id = auth.uid()) OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN')));

CREATE POLICY "Candidates can submit answers." ON public.application_answers
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.applications WHERE id = public.application_answers.application_id AND candidate_id = auth.uid()));

-- Saved Jobs Policies
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Candidates can view their saved jobs." ON public.saved_jobs
  FOR SELECT USING (candidate_id = auth.uid());

CREATE POLICY "Candidates can save jobs." ON public.saved_jobs
  FOR INSERT WITH CHECK (candidate_id = auth.uid());

CREATE POLICY "Candidates can unsave jobs." ON public.saved_jobs
  FOR DELETE USING (candidate_id = auth.uid());

-- 4. TRIGGERS FOR PROFILE CREATION
-- Automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id, 
    -- Default to user's email if name is missing
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'), 
    NEW.email, 
    -- Safe case-insensitive, explicit casting for role
    CASE 
      WHEN (NEW.raw_user_meta_data->>'role')::text = 'RECRUITER' THEN 'RECRUITER'::app_role
      WHEN (NEW.raw_user_meta_data->>'role')::text = 'ADMIN' THEN 'ADMIN'::app_role
      ELSE 'CANDIDATE'::app_role
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
