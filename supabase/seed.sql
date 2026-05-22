-- ============================================================================
-- Magis Market — Local Seed Data (Supabase)
-- This seed targets local development only.
-- Run with: supabase db reset
-- ============================================================================

-- Ensure pgcrypto is available for password hashing.
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Auth users (profiles are auto-created via trigger)
-- Password for all seeded users: "password"
-- ---------------------------------------------------------------------------

insert into auth.users (
	id,
	instance_id,
	aud,
	role,
	email,
	encrypted_password,
	email_confirmed_at,
	raw_app_meta_data,
	raw_user_meta_data,
	created_at,
	updated_at,
	is_super_admin,
	is_sso_user
) values
	(
		'11111111-1111-1111-1111-111111111111',
		(select id from auth.instances limit 1),
		'authenticated',
		'authenticated',
		'seller1@addu.edu.ph',
		crypt('password', gen_salt('bf')),
		now(),
		'{"provider":"email","providers":["email"]}',
		'{"full_name":"Seller One","role":"SELLER"}',
		now(),
		now(),
		false,
		false
	),
	(
		'22222222-2222-2222-2222-222222222222',
		(select id from auth.instances limit 1),
		'authenticated',
		'authenticated',
		'admin@addu.edu.ph',
		crypt('password', gen_salt('bf')),
		now(),
		'{"provider":"email","providers":["email"]}',
		'{"full_name":"Admin One","role":"ADMIN"}',
		now(),
		now(),
		false,
		false
	),
	(
		'33333333-3333-3333-3333-333333333333',
		(select id from auth.instances limit 1),
		'authenticated',
		'authenticated',
		'student@addu.edu.ph',
		crypt('password', gen_salt('bf')),
		now(),
		'{"provider":"email","providers":["email"]}',
		'{"full_name":"Student One","role":"BUYER"}',
		now(),
		now(),
		false,
		false
	);

-- ---------------------------------------------------------------------------
-- Listings
-- ---------------------------------------------------------------------------

insert into public.listings (
	id,
	seller_id,
	title,
	description,
	price,
	category,
	condition,
	status,
	created_at,
	updated_at
) values
	('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111', 'Intro to Programming Textbook', 'Used textbook in good condition.', 350.00, 'textbooks', 'good', 'active', now(), now()),
	('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '11111111-1111-1111-1111-111111111111', 'Wireless Mouse', 'Like new, barely used.', 499.00, 'electronics', 'like_new', 'active', now(), now()),
	('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '11111111-1111-1111-1111-111111111111', 'Study Desk', 'Sturdy desk, minor scratches.', 1500.00, 'furniture', 'good', 'active', now(), now()),
	('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '11111111-1111-1111-1111-111111111111', 'Hoodie (Large)', 'Comfortable, gently used.', 300.00, 'clothing', 'good', 'active', now(), now()),
	('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5', '11111111-1111-1111-1111-111111111111', 'Notebook Set', '5 notebooks bundle.', 120.00, 'supplies', 'new', 'active', now(), now()),

	('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', '22222222-2222-2222-2222-222222222222', 'Calculator', 'Scientific calculator, fully working.', 600.00, 'supplies', 'good', 'active', now(), now()),
	('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', '22222222-2222-2222-2222-222222222222', 'Gaming Keyboard', 'Mechanical keyboard.', 1200.00, 'electronics', 'good', 'active', now(), now()),
	('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3', '22222222-2222-2222-2222-222222222222', 'Office Chair', 'Comfortable chair, fair condition.', 800.00, 'furniture', 'fair', 'active', now(), now()),
	('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4', '22222222-2222-2222-2222-222222222222', 'Jacket (Medium)', 'Lightweight jacket.', 250.00, 'clothing', 'like_new', 'active', now(), now()),
	('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb5', '22222222-2222-2222-2222-222222222222', 'Pen Set', 'Assorted pens, unopened.', 80.00, 'supplies', 'new', 'active', now(), now()),

	('cccccccc-cccc-cccc-cccc-ccccccccccc1', '11111111-1111-1111-1111-111111111111', 'Dorm Lamp', 'Bright LED lamp.', 200.00, 'electronics', 'good', 'active', now(), now()),
	('cccccccc-cccc-cccc-cccc-ccccccccccc2', '22222222-2222-2222-2222-222222222222', 'Backpack', 'Spacious backpack.', 450.00, 'others', 'good', 'active', now(), now());

-- ---------------------------------------------------------------------------
-- Listing images (one primary-like image per listing)
-- ---------------------------------------------------------------------------

insert into public.listing_images (listing_id, storage_path, display_order)
select id, concat('images/', id, '/primary.jpg'), 0
from public.listings;

-- ---------------------------------------------------------------------------
-- Favorites (buyer favorites a few listings)
-- ---------------------------------------------------------------------------

insert into public.favorites (user_id, listing_id)
values
	('33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2'),
	('33333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2');

-- ---------------------------------------------------------------------------
-- Cart + cart items for buyer
-- ---------------------------------------------------------------------------

insert into public.carts (id, user_id)
values ('dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333');

insert into public.cart_items (cart_id, listing_id, quantity)
values
	('dddddddd-dddd-dddd-dddd-dddddddddddd', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 1),
	('dddddddd-dddd-dddd-dddd-dddddddddddd', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3', 2);
