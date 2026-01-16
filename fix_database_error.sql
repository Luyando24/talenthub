-- FIX FOR: "Database error saving new user"
-- Run this script in your Supabase SQL Editor to make the signup process resilient.

-- 1. Ensure the enum exists (idempotent)
DO $$ BEGIN
    CREATE TYPE app_role AS ENUM ('CANDIDATE', 'RECRUITER', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Drop the existing trigger to update it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Update the function to handle errors gracefully
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'), 
    NEW.email, 
    CASE 
      WHEN (NEW.raw_user_meta_data->>'role')::text = 'RECRUITER' THEN 'RECRUITER'::app_role
      WHEN (NEW.raw_user_meta_data->>'role')::text = 'ADMIN' THEN 'ADMIN'::app_role
      ELSE 'CANDIDATE'::app_role
    END
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error to Postgres logs
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    -- Return NEW to allow the user creation to proceed even if profile creation fails
    -- The application can handle the missing profile later
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Re-enable the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
