-- Create a new storage bucket for resumes
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', true);

-- Policy to allow authenticated users to upload their own resume
create policy "Authenticated users can upload resumes"
on storage.objects for insert
with check (
  bucket_id = 'resumes' and
  auth.role() = 'authenticated'
);

-- Policy to allow authenticated users to view resumes (needed for recruiters)
create policy "Authenticated users can view resumes"
on storage.objects for select
using (
  bucket_id = 'resumes' and
  auth.role() = 'authenticated'
);

-- Policy to allow users to update/delete their own resume
create policy "Users can update their own resume"
on storage.objects for update
using (
  bucket_id = 'resumes' and
  auth.uid() = owner
);

create policy "Users can delete their own resume"
on storage.objects for delete
using (
  bucket_id = 'resumes' and
  auth.uid() = owner
);
