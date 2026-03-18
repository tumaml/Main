-- Mezan — Full Section 19 Schema (clean slate)
-- Run this once on a fresh Supabase project.
-- All old migrations removed; this is the single source of truth.

-- ============================================================
-- Extensions
-- ============================================================
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";   -- full-text similarity search

-- ============================================================
-- USERS
-- ============================================================
create table public.users (
  id                uuid primary key default uuid_generate_v4(),
  clerk_id          text unique not null,
  username          text unique not null,
  display_name      text not null,
  bio               text,
  avatar_url        text,
  website_url       text,
  is_verified       boolean not null default false,
  is_seller         boolean not null default false,
  follower_count    integer not null default 0,
  following_count   integer not null default 0,
  like_count        integer not null default 0,   -- total likes received
  video_count       integer not null default 0,
  coin_balance      integer not null default 0,
  interests         text[] not null default '{}', -- onboarding interest tags
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index users_username_idx on public.users (username);
create index users_clerk_id_idx on public.users (clerk_id);

-- ============================================================
-- FOLLOWS
-- ============================================================
create table public.follows (
  follower_id   uuid not null references public.users(id) on delete cascade,
  following_id  uuid not null references public.users(id) on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (follower_id, following_id)
);

create index follows_following_id_idx on public.follows (following_id);

-- ============================================================
-- VIDEOS
-- ============================================================
create table public.videos (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.users(id) on delete cascade,
  caption         text not null default '',
  video_url       text not null,
  thumbnail_url   text,
  duration        integer,                        -- seconds
  width           integer,
  height          integer,
  privacy         text not null default 'public'  -- 'public' | 'friends' | 'private'
                    check (privacy in ('public', 'friends', 'private')),
  is_pinned       boolean not null default false,
  allow_comments  boolean not null default true,
  allow_duet      boolean not null default true,
  allow_stitch    boolean not null default true,
  sound_id        uuid,                           -- FK added after sounds table
  like_count      integer not null default 0,
  comment_count   integer not null default 0,
  share_count     integer not null default 0,
  bookmark_count  integer not null default 0,
  view_count      bigint not null default 0,
  tags            text[] not null default '{}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index videos_user_id_idx       on public.videos (user_id);
create index videos_created_at_idx    on public.videos (created_at desc);
create index videos_tags_idx          on public.videos using gin (tags);
create index videos_caption_trgm_idx  on public.videos using gin (caption gin_trgm_ops);

-- ============================================================
-- SOUNDS (original audio)
-- ============================================================
create table public.sounds (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references public.users(id) on delete set null,
  title         text not null,
  artist_name   text,
  cover_url     text,
  audio_url     text not null,
  duration      integer,                          -- seconds
  use_count     integer not null default 0,
  created_at    timestamptz not null default now()
);

-- Back-fill the FK on videos
alter table public.videos
  add constraint videos_sound_id_fkey
    foreign key (sound_id) references public.sounds(id) on delete set null;

-- ============================================================
-- VIDEO LIKES
-- ============================================================
create table public.video_likes (
  user_id     uuid not null references public.users(id) on delete cascade,
  video_id    uuid not null references public.videos(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, video_id)
);

create index video_likes_video_id_idx on public.video_likes (video_id);

-- ============================================================
-- BOOKMARKS
-- ============================================================
create table public.bookmarks (
  user_id     uuid not null references public.users(id) on delete cascade,
  video_id    uuid not null references public.videos(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, video_id)
);

create index bookmarks_user_id_idx on public.bookmarks (user_id);

-- ============================================================
-- COMMENTS
-- ============================================================
create table public.comments (
  id          uuid primary key default uuid_generate_v4(),
  video_id    uuid not null references public.videos(id) on delete cascade,
  user_id     uuid not null references public.users(id) on delete cascade,
  parent_id   uuid references public.comments(id) on delete cascade, -- 1-level reply
  content     text not null,
  like_count  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index comments_video_id_idx   on public.comments (video_id, created_at desc);
create index comments_parent_id_idx  on public.comments (parent_id);
create index comments_user_id_idx    on public.comments (user_id);

-- ============================================================
-- COMMENT LIKES
-- ============================================================
create table public.comment_likes (
  user_id     uuid not null references public.users(id) on delete cascade,
  comment_id  uuid not null references public.comments(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, comment_id)
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create table public.notifications (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.users(id) on delete cascade,  -- recipient
  actor_id     uuid references public.users(id) on delete cascade,           -- who triggered
  type         text not null  -- 'like' | 'comment' | 'follow' | 'mention' | 'reply' | 'purchase' | 'gift'
                 check (type in ('like','comment','follow','mention','reply','purchase','gift','system')),
  video_id     uuid references public.videos(id) on delete cascade,
  comment_id   uuid references public.comments(id) on delete cascade,
  is_read      boolean not null default false,
  message      text,
  created_at   timestamptz not null default now()
);

create index notifications_user_id_idx on public.notifications (user_id, created_at desc);

-- ============================================================
-- MESSAGES / INBOX
-- ============================================================
create table public.conversations (
  id            uuid primary key default uuid_generate_v4(),
  participant_a uuid not null references public.users(id) on delete cascade,
  participant_b uuid not null references public.users(id) on delete cascade,
  last_message  text,
  last_message_at timestamptz,
  created_at    timestamptz not null default now(),
  unique (participant_a, participant_b)
);

create index conversations_participant_a_idx on public.conversations (participant_a);
create index conversations_participant_b_idx on public.conversations (participant_b);

create table public.messages (
  id              uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id       uuid not null references public.users(id) on delete cascade,
  content         text not null,
  media_url       text,
  is_read         boolean not null default false,
  created_at      timestamptz not null default now()
);

create index messages_conversation_id_idx on public.messages (conversation_id, created_at asc);

-- ============================================================
-- SHOP — PRODUCTS
-- ============================================================
create table public.products (
  id              uuid primary key default uuid_generate_v4(),
  seller_id       uuid not null references public.users(id) on delete cascade,
  title           text not null,
  description     text,
  price           numeric(12,2) not null check (price >= 0),
  compare_price   numeric(12,2),                  -- original / crossed-out price
  currency        text not null default 'USD',
  inventory       integer not null default 0,
  images          text[] not null default '{}',
  category        text,
  tags            text[] not null default '{}',
  is_active       boolean not null default true,
  is_digital      boolean not null default false,
  rating          numeric(3,2) not null default 0,
  review_count    integer not null default 0,
  sold_count      integer not null default 0,
  stripe_price_id text,                           -- set when Stripe is configured
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index products_seller_id_idx  on public.products (seller_id);
create index products_category_idx   on public.products (category);
create index products_tags_idx       on public.products using gin (tags);
create index products_title_trgm_idx on public.products using gin (title gin_trgm_ops);

-- ============================================================
-- VIDEO ↔ PRODUCT LINKS (shoppable videos)
-- ============================================================
create table public.video_products (
  video_id    uuid not null references public.videos(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete cascade,
  position    integer not null default 0,         -- display order
  primary key (video_id, product_id)
);

-- ============================================================
-- SHOP — ORDERS
-- ============================================================
create table public.orders (
  id                  uuid primary key default uuid_generate_v4(),
  buyer_id            uuid not null references public.users(id) on delete restrict,
  seller_id           uuid not null references public.users(id) on delete restrict,
  status              text not null default 'pending'
                        check (status in ('pending','paid','shipped','delivered','refunded','cancelled')),
  subtotal            numeric(12,2) not null,
  shipping_cost       numeric(12,2) not null default 0,
  total               numeric(12,2) not null,
  currency            text not null default 'USD',
  stripe_payment_intent text,
  shipping_address    jsonb,
  tracking_number     text,
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index orders_buyer_id_idx  on public.orders (buyer_id);
create index orders_seller_id_idx on public.orders (seller_id);

create table public.order_items (
  id          uuid primary key default uuid_generate_v4(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete restrict,
  quantity    integer not null default 1 check (quantity > 0),
  unit_price  numeric(12,2) not null,
  total_price numeric(12,2) not null,
  snapshot    jsonb                                -- product snapshot at purchase time
);

create index order_items_order_id_idx on public.order_items (order_id);

-- ============================================================
-- AFFILIATE LINKS
-- ============================================================
create table public.affiliate_links (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete cascade,
  code        text unique not null,
  commission_rate numeric(5,4) not null default 0.05,  -- 5%
  click_count integer not null default 0,
  sale_count  integer not null default 0,
  earnings    numeric(12,2) not null default 0,
  created_at  timestamptz not null default now()
);

create index affiliate_links_user_id_idx on public.affiliate_links (user_id);
create index affiliate_links_code_idx    on public.affiliate_links (code);

-- ============================================================
-- COINS / GIFTS (Phase 5 — table created now, logic later)
-- ============================================================
create table public.coin_transactions (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  type        text not null
                check (type in ('purchase','earn','spend','gift_sent','gift_received','withdrawal')),
  amount      integer not null,                   -- positive = credit, negative = debit
  balance_after integer not null,
  reference_id uuid,                             -- order_id, video_id, etc.
  description text,
  created_at  timestamptz not null default now()
);

create index coin_transactions_user_id_idx on public.coin_transactions (user_id, created_at desc);

-- ============================================================
-- LIVE ROOMS (Phase 5)
-- ============================================================
create table public.live_rooms (
  id            uuid primary key default uuid_generate_v4(),
  host_id       uuid not null references public.users(id) on delete cascade,
  title         text not null,
  thumbnail_url text,
  room_code     text unique not null,             -- 100ms room ID
  status        text not null default 'scheduled'
                  check (status in ('scheduled','live','ended')),
  viewer_count  integer not null default 0,
  peak_viewers  integer not null default 0,
  started_at    timestamptz,
  ended_at      timestamptz,
  created_at    timestamptz not null default now()
);

create index live_rooms_host_id_idx on public.live_rooms (host_id);
create index live_rooms_status_idx  on public.live_rooms (status);

-- ============================================================
-- SELLER STORES
-- ============================================================
create table public.stores (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid unique not null references public.users(id) on delete cascade,
  name          text not null,
  description   text,
  logo_url      text,
  banner_url    text,
  stripe_account_id text,                         -- Stripe Connect
  is_approved   boolean not null default false,
  rating        numeric(3,2) not null default 0,
  review_count  integer not null default 0,
  sale_count    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============================================================
-- PRODUCT REVIEWS
-- ============================================================
create table public.product_reviews (
  id          uuid primary key default uuid_generate_v4(),
  product_id  uuid not null references public.products(id) on delete cascade,
  user_id     uuid not null references public.users(id) on delete cascade,
  order_id    uuid references public.orders(id) on delete set null,
  rating      integer not null check (rating between 1 and 5),
  content     text,
  images      text[] not null default '{}',
  created_at  timestamptz not null default now(),
  unique (product_id, user_id)
);

create index product_reviews_product_id_idx on public.product_reviews (product_id);

-- ============================================================
-- updated_at triggers
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_updated_at
  before update on public.users
  for each row execute procedure public.set_updated_at();

create trigger videos_updated_at
  before update on public.videos
  for each row execute procedure public.set_updated_at();

create trigger comments_updated_at
  before update on public.comments
  for each row execute procedure public.set_updated_at();

create trigger products_updated_at
  before update on public.products
  for each row execute procedure public.set_updated_at();

create trigger orders_updated_at
  before update on public.orders
  for each row execute procedure public.set_updated_at();

create trigger stores_updated_at
  before update on public.stores
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- Counter maintenance functions (called from triggers)
-- ============================================================

-- video_likes → videos.like_count + users.like_count
create or replace function public.update_video_like_counts()
returns trigger language plpgsql security definer as $$
begin
  if (TG_OP = 'INSERT') then
    update public.videos set like_count = like_count + 1 where id = NEW.video_id;
    update public.users  set like_count = like_count + 1
      where id = (select user_id from public.videos where id = NEW.video_id);
  elsif (TG_OP = 'DELETE') then
    update public.videos set like_count = greatest(like_count - 1, 0) where id = OLD.video_id;
    update public.users  set like_count = greatest(like_count - 1, 0)
      where id = (select user_id from public.videos where id = OLD.video_id);
  end if;
  return null;
end;
$$;

create trigger video_likes_counter
  after insert or delete on public.video_likes
  for each row execute procedure public.update_video_like_counts();

-- bookmarks → videos.bookmark_count
create or replace function public.update_bookmark_count()
returns trigger language plpgsql security definer as $$
begin
  if (TG_OP = 'INSERT') then
    update public.videos set bookmark_count = bookmark_count + 1 where id = NEW.video_id;
  elsif (TG_OP = 'DELETE') then
    update public.videos set bookmark_count = greatest(bookmark_count - 1, 0) where id = OLD.video_id;
  end if;
  return null;
end;
$$;

create trigger bookmarks_counter
  after insert or delete on public.bookmarks
  for each row execute procedure public.update_bookmark_count();

-- comments → videos.comment_count
create or replace function public.update_comment_count()
returns trigger language plpgsql security definer as $$
begin
  if (TG_OP = 'INSERT') then
    update public.videos set comment_count = comment_count + 1 where id = NEW.video_id;
  elsif (TG_OP = 'DELETE') then
    update public.videos set comment_count = greatest(comment_count - 1, 0) where id = OLD.video_id;
  end if;
  return null;
end;
$$;

create trigger comments_counter
  after insert or delete on public.comments
  for each row execute procedure public.update_comment_count();

-- comment_likes → comments.like_count
create or replace function public.update_comment_like_count()
returns trigger language plpgsql security definer as $$
begin
  if (TG_OP = 'INSERT') then
    update public.comments set like_count = like_count + 1 where id = NEW.comment_id;
  elsif (TG_OP = 'DELETE') then
    update public.comments set like_count = greatest(like_count - 1, 0) where id = OLD.comment_id;
  end if;
  return null;
end;
$$;

create trigger comment_likes_counter
  after insert or delete on public.comment_likes
  for each row execute procedure public.update_comment_like_count();

-- follows → follower_count + following_count
create or replace function public.update_follow_counts()
returns trigger language plpgsql security definer as $$
begin
  if (TG_OP = 'INSERT') then
    update public.users set follower_count  = follower_count  + 1 where id = NEW.following_id;
    update public.users set following_count = following_count + 1 where id = NEW.follower_id;
  elsif (TG_OP = 'DELETE') then
    update public.users set follower_count  = greatest(follower_count  - 1, 0) where id = OLD.following_id;
    update public.users set following_count = greatest(following_count - 1, 0) where id = OLD.follower_id;
  end if;
  return null;
end;
$$;

create trigger follows_counter
  after insert or delete on public.follows
  for each row execute procedure public.update_follow_counts();

-- videos → users.video_count
create or replace function public.update_video_count()
returns trigger language plpgsql security definer as $$
begin
  if (TG_OP = 'INSERT') then
    update public.users set video_count = video_count + 1 where id = NEW.user_id;
  elsif (TG_OP = 'DELETE') then
    update public.users set video_count = greatest(video_count - 1, 0) where id = OLD.user_id;
  end if;
  return null;
end;
$$;

create trigger videos_user_count
  after insert or delete on public.videos
  for each row execute procedure public.update_video_count();
