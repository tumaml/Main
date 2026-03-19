-- Mezan — Row Level Security Policies
-- Applied after 001_initial_schema.sql

-- ============================================================
-- Enable RLS on all tables
-- ============================================================
alter table public.users            enable row level security;
alter table public.follows          enable row level security;
alter table public.videos           enable row level security;
alter table public.sounds           enable row level security;
alter table public.video_likes      enable row level security;
alter table public.bookmarks        enable row level security;
alter table public.comments         enable row level security;
alter table public.comment_likes    enable row level security;
alter table public.notifications    enable row level security;
alter table public.conversations    enable row level security;
alter table public.messages         enable row level security;
alter table public.products         enable row level security;
alter table public.video_products   enable row level security;
alter table public.orders           enable row level security;
alter table public.order_items      enable row level security;
alter table public.affiliate_links  enable row level security;
alter table public.coin_transactions enable row level security;
alter table public.live_rooms       enable row level security;
alter table public.stores           enable row level security;
alter table public.product_reviews  enable row level security;

-- ============================================================
-- Helper: get current user's internal UUID from Clerk JWT
-- ============================================================
create or replace function public.current_user_id()
returns uuid language sql stable as $$
  select id from public.users
  where clerk_id = auth.jwt() ->> 'sub'
  limit 1
$$;

-- ============================================================
-- USERS
-- ============================================================
-- Anyone can read public profiles
create policy "users_select_public"  on public.users for select using (true);
-- Only the owner can update their own row
create policy "users_update_own"     on public.users for update using (id = public.current_user_id());
-- Insert handled by server-side webhook (service role bypasses RLS)
-- No delete allowed for users (soft-delete in Phase 4)

-- ============================================================
-- FOLLOWS
-- ============================================================
create policy "follows_select" on public.follows for select using (true);
create policy "follows_insert" on public.follows for insert with check (follower_id = public.current_user_id());
create policy "follows_delete" on public.follows for delete using (follower_id = public.current_user_id());

-- ============================================================
-- VIDEOS
-- ============================================================
create policy "videos_select_public" on public.videos for select using (
  privacy = 'public'
  or user_id = public.current_user_id()
  or (
    privacy = 'friends'
    and exists (
      select 1 from public.follows f1
      join public.follows f2 on f1.follower_id = f2.following_id and f1.following_id = f2.follower_id
      where f1.follower_id = public.current_user_id() and f1.following_id = public.videos.user_id
    )
  )
);
create policy "videos_insert_own"  on public.videos for insert with check (user_id = public.current_user_id());
create policy "videos_update_own"  on public.videos for update using (user_id = public.current_user_id());
create policy "videos_delete_own"  on public.videos for delete using (user_id = public.current_user_id());

-- ============================================================
-- SOUNDS
-- ============================================================
create policy "sounds_select" on public.sounds for select using (true);
create policy "sounds_insert" on public.sounds for insert with check (user_id = public.current_user_id());
create policy "sounds_delete" on public.sounds for delete using (user_id = public.current_user_id());

-- ============================================================
-- VIDEO LIKES
-- ============================================================
create policy "video_likes_select" on public.video_likes for select using (true);
create policy "video_likes_insert" on public.video_likes for insert with check (user_id = public.current_user_id());
create policy "video_likes_delete" on public.video_likes for delete using (user_id = public.current_user_id());

-- ============================================================
-- BOOKMARKS
-- ============================================================
create policy "bookmarks_select" on public.bookmarks for select using (user_id = public.current_user_id());
create policy "bookmarks_insert" on public.bookmarks for insert with check (user_id = public.current_user_id());
create policy "bookmarks_delete" on public.bookmarks for delete using (user_id = public.current_user_id());

-- ============================================================
-- COMMENTS
-- ============================================================
create policy "comments_select" on public.comments for select using (
  exists (
    select 1 from public.videos v
    where v.id = public.comments.video_id
    and (
      v.privacy = 'public'
      or v.user_id = public.current_user_id()
      or (
        v.privacy = 'friends'
        and exists (
          select 1 from public.follows f1
          join public.follows f2 on f1.follower_id = f2.following_id and f1.following_id = f2.follower_id
          where f1.follower_id = public.current_user_id() and f1.following_id = v.user_id
        )
      )
    )
  )
);
create policy "comments_insert" on public.comments for insert with check (
  user_id = public.current_user_id()
  and exists (
    select 1 from public.videos v where v.id = video_id and v.allow_comments = true
  )
);
create policy "comments_delete_own" on public.comments for delete using (
  user_id = public.current_user_id()
  -- video owner can also delete comments on their video
  or exists (select 1 from public.videos v where v.id = video_id and v.user_id = public.current_user_id())
);

-- ============================================================
-- COMMENT LIKES
-- ============================================================
create policy "comment_likes_select" on public.comment_likes for select using (true);
create policy "comment_likes_insert" on public.comment_likes for insert with check (user_id = public.current_user_id());
create policy "comment_likes_delete" on public.comment_likes for delete using (user_id = public.current_user_id());

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create policy "notifications_select" on public.notifications for select using (user_id = public.current_user_id());
create policy "notifications_update" on public.notifications for update using (user_id = public.current_user_id());
-- Inserts come from server triggers / service role only

-- ============================================================
-- CONVERSATIONS
-- ============================================================
create policy "conversations_select" on public.conversations for select using (
  participant_a = public.current_user_id()
  or participant_b = public.current_user_id()
);
create policy "conversations_insert" on public.conversations for insert with check (
  participant_a = public.current_user_id()
  or participant_b = public.current_user_id()
);

-- ============================================================
-- MESSAGES
-- ============================================================
create policy "messages_select" on public.messages for select using (
  exists (
    select 1 from public.conversations c
    where c.id = conversation_id
    and (c.participant_a = public.current_user_id() or c.participant_b = public.current_user_id())
  )
);
create policy "messages_insert" on public.messages for insert with check (
  sender_id = public.current_user_id()
  and exists (
    select 1 from public.conversations c
    where c.id = conversation_id
    and (c.participant_a = public.current_user_id() or c.participant_b = public.current_user_id())
  )
);

-- ============================================================
-- PRODUCTS
-- ============================================================
create policy "products_select_active" on public.products for select using (is_active = true or seller_id = public.current_user_id());
create policy "products_insert_seller" on public.products for insert with check (
  seller_id = public.current_user_id()
  and exists (select 1 from public.users u where u.id = public.current_user_id() and u.is_seller = true)
);
create policy "products_update_own"    on public.products for update using (seller_id = public.current_user_id());
create policy "products_delete_own"    on public.products for delete using (seller_id = public.current_user_id());

-- ============================================================
-- VIDEO PRODUCTS
-- ============================================================
create policy "video_products_select" on public.video_products for select using (true);
create policy "video_products_insert" on public.video_products for insert with check (
  exists (select 1 from public.videos v where v.id = video_id and v.user_id = public.current_user_id())
);
create policy "video_products_delete" on public.video_products for delete using (
  exists (select 1 from public.videos v where v.id = video_id and v.user_id = public.current_user_id())
);

-- ============================================================
-- ORDERS
-- ============================================================
create policy "orders_select_own" on public.orders for select using (
  buyer_id = public.current_user_id() or seller_id = public.current_user_id()
);
-- Inserts/updates done via service role from Stripe webhook

-- ============================================================
-- ORDER ITEMS
-- ============================================================
create policy "order_items_select_own" on public.order_items for select using (
  exists (
    select 1 from public.orders o
    where o.id = order_id
    and (o.buyer_id = public.current_user_id() or o.seller_id = public.current_user_id())
  )
);

-- ============================================================
-- AFFILIATE LINKS
-- ============================================================
create policy "affiliate_links_select" on public.affiliate_links for select using (true);
create policy "affiliate_links_insert" on public.affiliate_links for insert with check (user_id = public.current_user_id());
create policy "affiliate_links_update" on public.affiliate_links for update using (user_id = public.current_user_id());
create policy "affiliate_links_delete" on public.affiliate_links for delete using (user_id = public.current_user_id());

-- ============================================================
-- COIN TRANSACTIONS
-- ============================================================
create policy "coin_transactions_select" on public.coin_transactions for select using (user_id = public.current_user_id());
-- Writes from service role only

-- ============================================================
-- LIVE ROOMS
-- ============================================================
create policy "live_rooms_select" on public.live_rooms for select using (true);
create policy "live_rooms_insert" on public.live_rooms for insert with check (host_id = public.current_user_id());
create policy "live_rooms_update" on public.live_rooms for update using (host_id = public.current_user_id());

-- ============================================================
-- STORES
-- ============================================================
create policy "stores_select"       on public.stores for select using (true);
create policy "stores_insert"       on public.stores for insert with check (user_id = public.current_user_id());
create policy "stores_update_own"   on public.stores for update using (user_id = public.current_user_id());

-- ============================================================
-- PRODUCT REVIEWS
-- ============================================================
create policy "product_reviews_select" on public.product_reviews for select using (true);
create policy "product_reviews_insert" on public.product_reviews for insert with check (
  user_id = public.current_user_id()
  -- Must have a completed order for this product
  and exists (
    select 1 from public.order_items oi
    join public.orders o on o.id = oi.order_id
    where oi.product_id = product_reviews.product_id
    and o.buyer_id = public.current_user_id()
    and o.status = 'delivered'
  )
);
create policy "product_reviews_update_own" on public.product_reviews for update using (user_id = public.current_user_id());
create policy "product_reviews_delete_own" on public.product_reviews for delete using (user_id = public.current_user_id());
