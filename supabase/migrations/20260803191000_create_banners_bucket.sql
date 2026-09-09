-- Migration: create_banners_bucket
-- Public banner storage for member profile covers.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'banners',
  'banners',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Anyone can read banner images (public bucket).
create policy "banners_select_public"
  on storage.objects
  for select
  using (bucket_id = 'banners');

-- Users can upload to their own folder; admins can upload anywhere.
create policy "banners_insert_own_or_admin"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'banners'
    and (
      public.is_admin()
      or (storage.foldername(name))[1] = auth.uid()::text
    )
  );

create policy "banners_update_own_or_admin"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'banners'
    and (
      public.is_admin()
      or (storage.foldername(name))[1] = auth.uid()::text
    )
  )
  with check (
    bucket_id = 'banners'
    and (
      public.is_admin()
      or (storage.foldername(name))[1] = auth.uid()::text
    )
  );

create policy "banners_delete_own_or_admin"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'banners'
    and (
      public.is_admin()
      or (storage.foldername(name))[1] = auth.uid()::text
    )
  );
