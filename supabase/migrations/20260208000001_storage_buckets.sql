-- ============================================================================
-- Magis Market — Storage Buckets
-- Sets up the listing-images bucket in Supabase Storage.
-- ============================================================================

-- Create a public bucket for listing images.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-images',
  'listing-images',
  true,
  5242880,  -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp']
);

-- ---------- STORAGE RLS POLICIES ----------

-- Anyone can view listing images (public bucket).
create policy "Listing images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'listing-images');

-- Authenticated users can upload images.
create policy "Authenticated users can upload listing images"
  on storage.objects for insert
  with check (
    bucket_id = 'listing-images'
    and auth.role() = 'authenticated'
  );

-- Users can update their own uploaded images.
create policy "Users can update own listing images"
  on storage.objects for update
  using (
    bucket_id = 'listing-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own uploaded images.
create policy "Users can delete own listing images"
  on storage.objects for delete
  using (
    bucket_id = 'listing-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
