-- ============================================================================
-- Magis Market — Favorites
-- Tracks which listings a user has favorited.
-- ============================================================================

create table favorites (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  listing_id uuid not null references listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, listing_id)
);

create index idx_favorites_user    on favorites(user_id);
create index idx_favorites_listing on favorites(listing_id);

alter table favorites enable row level security;

-- Users can see their own favorites.
create policy "Users can view own favorites"
  on favorites for select
  using (auth.uid() = user_id);

-- Users can favorite listings as themselves.
create policy "Users can create favorites for themselves"
  on favorites for insert
  with check (auth.uid() = user_id);

-- Users can remove their own favorites.
create policy "Users can delete own favorites"
  on favorites for delete
  using (auth.uid() = user_id);

