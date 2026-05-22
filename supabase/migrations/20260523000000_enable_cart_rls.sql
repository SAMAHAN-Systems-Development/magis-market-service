-- ============================================================================
-- Magis Market — Enable RLS for carts and cart_items
-- ============================================================================

alter table carts enable row level security;
alter table cart_items enable row level security;

-- Carts: only owner can read/write.
create policy "Users can view own cart"
  on carts for select
  using (auth.uid() = user_id);

create policy "Users can create own cart"
  on carts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own cart"
  on carts for update
  using (auth.uid() = user_id);

create policy "Users can delete own cart"
  on carts for delete
  using (auth.uid() = user_id);

-- Cart items: must belong to a cart owned by the user.
create policy "Users can view own cart items"
  on cart_items for select
  using (
    exists (
      select 1 from carts
      where carts.id = cart_items.cart_id
        and carts.user_id = auth.uid()
    )
  );

create policy "Users can add items to own cart"
  on cart_items for insert
  with check (
    exists (
      select 1 from carts
      where carts.id = cart_items.cart_id
        and carts.user_id = auth.uid()
    )
  );

create policy "Users can update items in own cart"
  on cart_items for update
  using (
    exists (
      select 1 from carts
      where carts.id = cart_items.cart_id
        and carts.user_id = auth.uid()
    )
  );

create policy "Users can delete items from own cart"
  on cart_items for delete
  using (
    exists (
      select 1 from carts
      where carts.id = cart_items.cart_id
        and carts.user_id = auth.uid()
    )
  );
