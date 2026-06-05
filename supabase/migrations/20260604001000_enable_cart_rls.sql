alter table public.carts enable row level security;
alter table public.cart_items enable row level security;

drop policy if exists "Users can view own cart"
  on public.carts;
drop policy if exists "Users can create own cart"
  on public.carts;
drop policy if exists "Users can update own cart"
  on public.carts;
drop policy if exists "Users can delete own cart"
  on public.carts;

create policy "Users can view own cart"
  on public.carts for select
  using (auth.uid() = user_id);

create policy "Users can create own cart"
  on public.carts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own cart"
  on public.carts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own cart"
  on public.carts for delete
  using (auth.uid() = user_id);

drop policy if exists "Users can view own cart items"
  on public.cart_items;
drop policy if exists "Users can create own cart items"
  on public.cart_items;
drop policy if exists "Users can update own cart items"
  on public.cart_items;
drop policy if exists "Users can delete own cart items"
  on public.cart_items;

create policy "Users can view own cart items"
  on public.cart_items for select
  using (
    exists (
      select 1
      from public.carts
      where carts.id = cart_items.cart_id
        and carts.user_id = auth.uid()
    )
  );

create policy "Users can create own cart items"
  on public.cart_items for insert
  with check (
    exists (
      select 1
      from public.carts
      where carts.id = cart_items.cart_id
        and carts.user_id = auth.uid()
    )
  );

create policy "Users can update own cart items"
  on public.cart_items for update
  using (
    exists (
      select 1
      from public.carts
      where carts.id = cart_items.cart_id
        and carts.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.carts
      where carts.id = cart_items.cart_id
        and carts.user_id = auth.uid()
    )
  );

create policy "Users can delete own cart items"
  on public.cart_items for delete
  using (
    exists (
      select 1
      from public.carts
      where carts.id = cart_items.cart_id
        and carts.user_id = auth.uid()
    )
  );
