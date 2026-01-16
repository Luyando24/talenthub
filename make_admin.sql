-- SQL to make a user an ADMIN
-- Replace 'target_email@example.com' with the actual email of the user you want to promote

UPDATE public.profiles
SET role = 'ADMIN'
WHERE email = 'target_email@example.com';

-- Optional: Verify the update
-- SELECT * FROM public.profiles WHERE email = 'target_email@example.com';
