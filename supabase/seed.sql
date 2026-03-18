-- Mezan — Seed Data (Phase 1 development only)
-- Uses the public Mux HLS test stream for all videos.
-- Run AFTER migrations in a fresh Supabase project.
-- DO NOT run in production.

-- ============================================================
-- Seed users (clerk_id values are placeholders — replace with
-- real Clerk user IDs from your dev dashboard after sign-up)
-- ============================================================
insert into public.users (id, clerk_id, username, display_name, bio, avatar_url, is_verified, follower_count, following_count, video_count)
values
  ('11111111-0000-0000-0000-000000000001', 'clerk_seed_user_1', 'mezan_official', 'Mezan Official',  'The official Mezan account 🎉',                 null, true,  18400, 0,    5),
  ('11111111-0000-0000-0000-000000000002', 'clerk_seed_user_2', 'alexcreates',    'Alex Creates',    'Content creator • Travel • Food 🌍',            null, false, 4200,  120,  5),
  ('11111111-0000-0000-0000-000000000003', 'clerk_seed_user_3', 'dancewithjane',  'Dance With Jane', 'Dance videos every day 💃 • DMs open',          null, true,  92100, 300,  5),
  ('11111111-0000-0000-0000-000000000004', 'clerk_seed_user_4', 'chefmaria',      'Chef Maria',      'Home cooking made easy 🍳 • New recipe weekly', null, false, 7800,  55,   5),
  ('11111111-0000-0000-0000-000000000005', 'clerk_seed_user_5', 'hikingwithkate', 'Hiking With Kate','Adventure awaits 🏔️ • Pacific Crest Trail 2026', null, false, 3100,  80,   5)
on conflict (clerk_id) do nothing;

-- ============================================================
-- Seed videos (all using the Mux public HLS test stream)
-- ============================================================
insert into public.videos (id, user_id, caption, video_url, thumbnail_url, privacy, like_count, comment_count, share_count, view_count, tags)
values
  (
    '22222222-0000-0000-0000-000000000001',
    '11111111-0000-0000-0000-000000000001',
    'Welcome to Mezan! 🎉 The TikTok + shopping experience you''ve been waiting for. #mezan #launch',
    'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    null,
    'public',
    18400, 342, 890, 284000,
    array['mezan','launch','announcement']
  ),
  (
    '22222222-0000-0000-0000-000000000002',
    '11111111-0000-0000-0000-000000000002',
    'Exploring the streets of Lisbon 🇵🇹 This city never disappoints! #travel #lisbon #europe',
    'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    null,
    'public',
    4231, 128, 201, 67000,
    array['travel','lisbon','europe']
  ),
  (
    '22222222-0000-0000-0000-000000000003',
    '11111111-0000-0000-0000-000000000003',
    'New choreography drop 💃🔥 Learn this in 60 seconds! #dance #choreography #trending',
    'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    null,
    'public',
    92100, 1840, 5200, 1420000,
    array['dance','choreography','trending']
  ),
  (
    '22222222-0000-0000-0000-000000000004',
    '11111111-0000-0000-0000-000000000004',
    '5-ingredient pasta that will change your life 🍝 Recipe in comments! #cooking #pasta #easyrecipe',
    'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    null,
    'public',
    7831, 412, 1100, 118000,
    array['cooking','pasta','easyrecipe','food']
  ),
  (
    '22222222-0000-0000-0000-000000000005',
    '11111111-0000-0000-0000-000000000005',
    'Day 47 on the Pacific Crest Trail ⛺🏔️ 1,200 miles down, 1,450 to go. #hiking #pct #adventure',
    'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    null,
    'public',
    3142, 287, 430, 49000,
    array['hiking','pct','adventure','outdoors']
  )
on conflict (id) do nothing;

-- ============================================================
-- Seed follows (mutual between users for friends tab testing)
-- ============================================================
insert into public.follows (follower_id, following_id) values
  ('11111111-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000001'),
  ('11111111-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000002'),
  ('11111111-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000003'),
  ('11111111-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000002'),
  ('11111111-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000001'),
  ('11111111-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000001')
on conflict do nothing;

-- ============================================================
-- Seed store
-- ============================================================
insert into public.stores (id, user_id, name, description, is_approved)
values
  ('33333333-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000004', 'Chef Maria Kitchen', 'Premium cookware and ingredients used in my videos', true)
on conflict (user_id) do nothing;

-- ============================================================
-- Seed products
-- ============================================================
insert into public.products (id, seller_id, title, description, price, compare_price, images, category, inventory, sold_count, rating, review_count, is_active, tags)
values
  (
    '44444444-0000-0000-0000-000000000001',
    '11111111-0000-0000-0000-000000000004',
    'Non-Stick Ceramic Pan 10"',
    'The exact pan used in all my cooking videos. Naturally non-stick, oven-safe to 450°F.',
    4999,
    6999,
    array['https://picsum.photos/seed/pan1/800/800'],
    'kitchen',
    120, 892, 4.8, 234,
    true,
    array['kitchen','cooking','pans']
  ),
  (
    '44444444-0000-0000-0000-000000000002',
    '11111111-0000-0000-0000-000000000004',
    'Artisan Pasta Bundle (3-pack)',
    'Imported Italian pasta — the secret to my 5-ingredient pasta recipe. Bronze-cut, slow-dried.',
    1899,
    null,
    array['https://picsum.photos/seed/pasta1/800/800'],
    'food',
    350, 2341, 4.9, 567,
    true,
    array['food','pasta','italian']
  )
on conflict (id) do nothing;

-- Update seller flag for seed sellers
update public.users set is_seller = true where id = '11111111-0000-0000-0000-000000000004';
