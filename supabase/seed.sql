-- Demo seed data for Phase 1
-- Note: Replace clerk_ids with real ones from your Clerk dashboard when deploying

-- Demo users
INSERT INTO users (id, clerk_id, username, display_name, avatar_url, bio, is_verified, follower_count, following_count, video_count)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'user_demo1', 'alexcreates', 'Alex Creates', 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', 'Content creator 🎬 | Travel & Food', true, 128500, 342, 87),
  ('00000000-0000-0000-0000-000000000002', 'user_demo2', 'sarahstyle', 'Sarah Style', 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', 'Fashion & Beauty 💄 | New York', true, 89200, 1200, 143),
  ('00000000-0000-0000-0000-000000000003', 'user_demo3', 'techwithtom', 'Tech With Tom', 'https://api.dicebear.com/7.x/avataaars/svg?seed=tom', 'Tech reviews & gadgets 💻', false, 45000, 567, 62);

-- Demo hashtags
INSERT INTO hashtags (id, name, video_count)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'fyp', 9800000),
  ('10000000-0000-0000-0000-000000000002', 'viral', 7200000),
  ('10000000-0000-0000-0000-000000000003', 'travel', 3400000),
  ('10000000-0000-0000-0000-000000000004', 'fashion', 4100000),
  ('10000000-0000-0000-0000-000000000005', 'tech', 2800000),
  ('10000000-0000-0000-0000-000000000006', 'food', 5600000),
  ('10000000-0000-0000-0000-000000000007', 'comedy', 6300000),
  ('10000000-0000-0000-0000-000000000008', 'dance', 8900000);

-- Demo sounds
INSERT INTO sounds (id, title, artist, audio_url, use_count, is_original)
VALUES
  ('20000000-0000-0000-0000-000000000001', 'Summer Vibes', 'LoFi Beats', '/audio/summer-vibes.mp3', 284000, false),
  ('20000000-0000-0000-0000-000000000002', 'Epic Cinematic', 'CinematicStudio', '/audio/epic-cinematic.mp3', 127000, false),
  ('20000000-0000-0000-0000-000000000003', 'Original Sound', 'alexcreates', '/audio/original-1.mp3', 8400, true);

-- Demo videos using free Cloudflare Stream test URLs (use your own video URLs)
INSERT INTO videos (id, user_id, sound_id, caption, video_url, thumbnail_url, duration, like_count, comment_count, share_count, view_count, status, privacy)
VALUES
  (
    '30000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    'Exploring the hidden gems of Tokyo 🇯🇵✨ Drop a 🗾 if you want a full guide! #travel #japan #fyp #viral',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    'https://picsum.photos/seed/tokyo/1080/1920',
    15,
    284500,
    3420,
    18900,
    1250000,
    'ready',
    'public'
  ),
  (
    '30000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000002',
    'GRWM for New York Fashion Week 👗💅 This look took 2 hours but SO worth it! #fashion #grwm #nyfw #style',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://picsum.photos/seed/fashion/1080/1920',
    28,
    189200,
    5670,
    12400,
    890000,
    'ready',
    'public'
  ),
  (
    '30000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000003',
    '20000000-0000-0000-0000-000000000001',
    'This $30 gadget from Amazon is actually INSANE 🤯 Link in bio! #tech #gadgets #amazon #fyp',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    'https://picsum.photos/seed/tech/1080/1920',
    22,
    97800,
    2890,
    8700,
    456000,
    'ready',
    'public'
  );

-- Link hashtags to videos
INSERT INTO video_hashtags (video_id, hashtag_id)
VALUES
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003'),
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002'),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004'),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000005'),
  ('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001');

-- Demo store
INSERT INTO stores (id, user_id, name, description, is_verified, product_count, rating)
VALUES
  ('40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Sarah Style Shop', 'Curated fashion & beauty finds 💫', true, 24, 4.8);

-- Demo products
INSERT INTO products (id, store_id, name, description, price, images, category, inventory, sold_count, rating, review_count)
VALUES
  (
    '50000000-0000-0000-0000-000000000001',
    '40000000-0000-0000-0000-000000000001',
    'Y2K Butterfly Crop Top',
    'As seen in my GRWM video! Super stretchy and comfy. Available in 3 colors.',
    2999,
    ARRAY['https://picsum.photos/seed/top1/800/800', 'https://picsum.photos/seed/top2/800/800'],
    'fashion',
    150,
    892,
    4.7,
    234
  ),
  (
    '50000000-0000-0000-0000-000000000002',
    '40000000-0000-0000-0000-000000000001',
    'Glazed Donut Lip Oil',
    'Viral lip oil that gives you the perfect glossy look. 8-hour moisture.',
    1499,
    ARRAY['https://picsum.photos/seed/lip1/800/800', 'https://picsum.photos/seed/lip2/800/800'],
    'beauty',
    340,
    2341,
    4.9,
    567
  );
