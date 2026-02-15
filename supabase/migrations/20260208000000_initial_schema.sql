-- ============================================================================
-- Magis Market — Initial Schema
-- A marketplace for Ateneo de Davao University students.
-- ============================================================================

-- ---------- ENUM-LIKE TYPES ----------

create type listing_category as enum (
  'textbooks',
  'electronics',
  'clothing',
  'furniture',
  'supplies',
  'others'
);

create type listing_condition as enum (
  'new',
  'like_new',
  'good',
  'fair',
  'poor'
);

create type listing_status as enum (
  'active',
  'sold',
  'reserved',
  'deleted'
);

-- ---------- PROFILES ----------
-- Extends Supabase Auth; one row per authenticated user.

create table profiles (
  id          uuid primary key references auth.users on delete cascade,
  full_name   text not null,
  avatar_url  text,
  student_id  text unique,
  contact_number text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-create a profile row when a new user signs up.
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------- LISTINGS ----------

create table listings (
  id          uuid primary key default gen_random_uuid(),
  seller_id   uuid not null references profiles(id) on delete cascade,
  title       text not null,
  description text not null default '',
  price       numeric(10,2) not null check (price >= 0),
  category    listing_category not null,
  condition   listing_condition not null,
  status      listing_status not null default 'active',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_listings_seller  on listings(seller_id);
create index idx_listings_status  on listings(status);
create index idx_listings_category on listings(category);

-- ---------- LISTING IMAGES ----------

create table listing_images (
  id            uuid primary key default gen_random_uuid(),
  listing_id    uuid not null references listings(id) on delete cascade,
  storage_path  text not null,
  display_order int  not null default 0,
  created_at    timestamptz not null default now()
);

create index idx_listing_images_listing on listing_images(listing_id);

-- ---------- CONVERSATIONS ----------
-- One conversation per buyer–listing pair.

create table conversations (
  id         uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id) on delete cascade,
  buyer_id   uuid not null references profiles(id) on delete cascade,
  seller_id  uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (listing_id, buyer_id)
);

create index idx_conversations_buyer  on conversations(buyer_id);
create index idx_conversations_seller on conversations(seller_id);

-- ---------- MESSAGES ----------

create table messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id       uuid not null references profiles(id) on delete cascade,
  content         text not null,
  is_read         boolean not null default false,
  created_at      timestamptz not null default now()
);

create index idx_messages_conversation on messages(conversation_id);
create index idx_messages_sender       on messages(sender_id);

-- ---------- UPDATED_AT TRIGGER ----------
-- Reusable trigger function that bumps updated_at on any UPDATE.

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

create trigger trg_listings_updated_at
  before update on listings
  for each row execute function set_updated_at();

create trigger trg_conversations_updated_at
  before update on conversations
  for each row execute function set_updated_at();

-- ---------- ROW LEVEL SECURITY ----------

alter table profiles       enable row level security;
alter table listings       enable row level security;
alter table listing_images enable row level security;
alter table conversations  enable row level security;
alter table messages       enable row level security;

-- Profiles: anyone can read, only owner can update.
create policy "Profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Listings: anyone can read active, owner can CRUD.
create policy "Active listings are viewable by everyone"
  on listings for select using (status != 'deleted');

create policy "Users can insert own listings"
  on listings for insert with check (auth.uid() = seller_id);

create policy "Users can update own listings"
  on listings for update using (auth.uid() = seller_id);

create policy "Users can delete own listings"
  on listings for delete using (auth.uid() = seller_id);

-- Listing images: follow listing visibility.
create policy "Listing images are viewable by everyone"
  on listing_images for select using (true);

create policy "Users can insert images for own listings"
  on listing_images for insert
  with check (
    exists (
      select 1 from listings
      where listings.id = listing_id and listings.seller_id = auth.uid()
    )
  );

create policy "Users can delete images for own listings"
  on listing_images for delete
  using (
    exists (
      select 1 from listings
      where listings.id = listing_id and listings.seller_id = auth.uid()
    )
  );

-- Conversations: only participants can see their conversations.
create policy "Participants can view conversations"
  on conversations for select
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

create policy "Buyers can start conversations"
  on conversations for insert
  with check (auth.uid() = buyer_id);

-- Messages: only conversation participants can read/write.
create policy "Participants can view messages"
  on messages for select
  using (
    exists (
      select 1 from conversations
      where conversations.id = conversation_id
        and (conversations.buyer_id = auth.uid() or conversations.seller_id = auth.uid())
    )
  );

create policy "Participants can send messages"
  on messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from conversations
      where conversations.id = conversation_id
        and (conversations.buyer_id = auth.uid() or conversations.seller_id = auth.uid())
    )
  );

create policy "Recipients can mark messages as read"
  on messages for update
  using (
    exists (
      select 1 from conversations
      where conversations.id = conversation_id
        and (conversations.buyer_id = auth.uid() or conversations.seller_id = auth.uid())
    )
  )
  with check (
    -- Only allow updating is_read, not content
    sender_id = (select sender_id from messages m where m.id = messages.id)
  );
