// Mezan — TypeScript types matching the Section 19 database schema.
// Keep in sync with supabase/migrations/001_initial_schema.sql

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// ============================================================
// Core entity types
// ============================================================

export interface User {
  id: string
  clerk_id: string
  username: string
  display_name: string
  bio: string | null
  avatar_url: string | null
  website_url: string | null
  is_verified: boolean
  is_seller: boolean
  follower_count: number
  following_count: number
  like_count: number       // total likes received on all videos
  video_count: number
  coin_balance: number
  interests: string[]
  created_at: string
  updated_at: string
}

export interface Video {
  id: string
  user_id: string
  caption: string
  video_url: string
  thumbnail_url: string | null
  duration: number | null
  width: number | null
  height: number | null
  privacy: 'public' | 'friends' | 'private'
  is_pinned: boolean
  allow_comments: boolean
  allow_duet: boolean
  allow_stitch: boolean
  sound_id: string | null
  like_count: number
  comment_count: number
  share_count: number
  bookmark_count: number
  view_count: number
  tags: string[]
  created_at: string
  updated_at: string
  // Marketplace fields (added in 003_marketplace_fields.sql)
  listing_type: 'product' | 'service' | null
  title: string | null
  price: number | null
  currency: string | null
  condition: 'new' | 'used' | 'refurbished' | null
  location: string | null
  // Joined fields (not in DB columns)
  user?: User
  is_liked?: boolean
  is_bookmarked?: boolean
  linked_product?: Product | null
}

export interface Follow {
  follower_id: string
  following_id: string
  created_at: string
}

export interface VideoLike {
  user_id: string
  video_id: string
  created_at: string
}

export interface Bookmark {
  user_id: string
  video_id: string
  created_at: string
}

export interface Comment {
  id: string
  video_id: string
  user_id: string
  parent_id: string | null
  content: string
  like_count: number
  created_at: string
  updated_at: string
  // Joined fields
  user?: User
  replies?: Comment[]
}

export interface CommentLike {
  user_id: string
  comment_id: string
  created_at: string
}

export interface Sound {
  id: string
  user_id: string | null
  title: string
  artist_name: string | null
  cover_url: string | null
  audio_url: string
  duration: number | null
  use_count: number
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  actor_id: string | null
  type: 'like' | 'comment' | 'follow' | 'mention' | 'reply' | 'purchase' | 'gift' | 'system'
  video_id: string | null
  comment_id: string | null
  is_read: boolean
  message: string | null
  created_at: string
  // Joined fields
  actor?: User
  video?: Pick<Video, 'id' | 'thumbnail_url' | 'caption'>
}

export interface Conversation {
  id: string
  participant_a: string
  participant_b: string
  last_message: string | null
  last_message_at: string | null
  created_at: string
  // Joined fields
  other_user?: User
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  media_url: string | null
  is_read: boolean
  created_at: string
  sender?: User
}

// ============================================================
// Shop types
// ============================================================

export interface Product {
  id: string
  seller_id: string
  title: string
  description: string | null
  price: number              // in cents (numeric 12,2 stored as JS number)
  compare_price: number | null
  currency: string
  inventory: number
  images: string[]
  category: string | null
  tags: string[]
  is_active: boolean
  is_digital: boolean
  rating: number
  review_count: number
  sold_count: number
  stripe_price_id: string | null
  // Marketplace fields (added in 003_marketplace_fields.sql)
  listing_type: 'product' | 'service' | null
  condition: 'new' | 'used' | 'refurbished' | null
  location: string | null
  created_at: string
  updated_at: string
  // Joined fields
  seller?: User
  store?: Store
}

export interface VideoProduct {
  video_id: string
  product_id: string
  position: number
}

export interface Order {
  id: string
  buyer_id: string
  seller_id: string
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'refunded' | 'cancelled'
  subtotal: number
  shipping_cost: number
  total: number
  currency: string
  stripe_payment_intent: string | null
  shipping_address: Json | null
  tracking_number: string | null
  notes: string | null
  created_at: string
  updated_at: string
  // Joined fields
  items?: OrderItem[]
  buyer?: User
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
  snapshot: Json | null
  product?: Product
}

export interface AffiliateLink {
  id: string
  user_id: string
  product_id: string
  code: string
  commission_rate: number
  click_count: number
  sale_count: number
  earnings: number
  created_at: string
}

export interface CoinTransaction {
  id: string
  user_id: string
  type: 'purchase' | 'earn' | 'spend' | 'gift_sent' | 'gift_received' | 'withdrawal'
  amount: number
  balance_after: number
  reference_id: string | null
  description: string | null
  created_at: string
}

export interface LiveRoom {
  id: string
  host_id: string
  title: string
  thumbnail_url: string | null
  room_code: string
  status: 'scheduled' | 'live' | 'ended'
  viewer_count: number
  peak_viewers: number
  started_at: string | null
  ended_at: string | null
  created_at: string
  host?: User
}

export interface Store {
  id: string
  user_id: string
  name: string
  description: string | null
  logo_url: string | null
  banner_url: string | null
  stripe_account_id: string | null
  is_approved: boolean
  rating: number
  review_count: number
  sale_count: number
  created_at: string
  updated_at: string
}

export interface ProductReview {
  id: string
  product_id: string
  user_id: string
  order_id: string | null
  rating: number
  content: string | null
  images: string[]
  created_at: string
  user?: User
}

// ============================================================
// Database shape for Supabase generic client
// (used with createClient<Database> when strict typing is needed)
// ============================================================
export interface Database {
  public: {
    Tables: {
      users:             { Row: User;         Insert: Omit<User, 'created_at' | 'updated_at'>; Update: Partial<Omit<User, 'id'>> }
      videos:            { Row: Video;        Insert: Omit<Video, 'created_at' | 'updated_at' | 'like_count' | 'comment_count' | 'share_count' | 'bookmark_count' | 'view_count' | 'user' | 'is_liked' | 'is_bookmarked' | 'linked_product'>; Update: Partial<Omit<Video, 'id'>> }
      follows:           { Row: Follow;       Insert: Omit<Follow, 'created_at'>;       Update: never }
      video_likes:       { Row: VideoLike;    Insert: Omit<VideoLike, 'created_at'>;    Update: never }
      bookmarks:         { Row: Bookmark;     Insert: Omit<Bookmark, 'created_at'>;     Update: never }
      comments:          { Row: Comment;      Insert: Omit<Comment, 'created_at' | 'updated_at' | 'like_count'>; Update: Partial<Omit<Comment, 'id'>> }
      comment_likes:     { Row: CommentLike;  Insert: Omit<CommentLike, 'created_at'>; Update: never }
      sounds:            { Row: Sound;        Insert: Omit<Sound, 'created_at' | 'use_count'>; Update: Partial<Omit<Sound, 'id'>> }
      notifications:     { Row: Notification; Insert: Omit<Notification, 'created_at' | 'is_read'>; Update: Partial<Omit<Notification, 'id'>> }
      conversations:     { Row: Conversation; Insert: Omit<Conversation, 'created_at'>; Update: Partial<Omit<Conversation, 'id'>> }
      messages:          { Row: Message;      Insert: Omit<Message, 'created_at' | 'is_read'>; Update: Partial<Omit<Message, 'id'>> }
      products:          { Row: Product;      Insert: Omit<Product, 'created_at' | 'updated_at' | 'rating' | 'review_count' | 'sold_count'>; Update: Partial<Omit<Product, 'id'>> }
      video_products:    { Row: VideoProduct; Insert: VideoProduct; Update: Partial<VideoProduct> }
      orders:            { Row: Order;        Insert: Omit<Order, 'created_at' | 'updated_at'>; Update: Partial<Omit<Order, 'id'>> }
      order_items:       { Row: OrderItem;    Insert: Omit<OrderItem, 'id'>; Update: never }
      affiliate_links:   { Row: AffiliateLink; Insert: Omit<AffiliateLink, 'created_at' | 'click_count' | 'sale_count' | 'earnings'>; Update: Partial<Omit<AffiliateLink, 'id'>> }
      coin_transactions: { Row: CoinTransaction; Insert: Omit<CoinTransaction, 'id' | 'created_at'>; Update: never }
      live_rooms:        { Row: LiveRoom;     Insert: Omit<LiveRoom, 'created_at' | 'viewer_count' | 'peak_viewers'>; Update: Partial<Omit<LiveRoom, 'id'>> }
      stores:            { Row: Store;        Insert: Omit<Store, 'created_at' | 'updated_at' | 'rating' | 'review_count' | 'sale_count'>; Update: Partial<Omit<Store, 'id'>> }
      product_reviews:   { Row: ProductReview; Insert: Omit<ProductReview, 'id' | 'created_at'>; Update: Partial<Omit<ProductReview, 'id'>> }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
