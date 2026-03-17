export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Omit<User, 'created_at' | 'updated_at'>
        Update: Partial<Omit<User, 'id'>>
      }
      videos: {
        Row: Video
        Insert: Omit<Video, 'created_at' | 'updated_at' | 'like_count' | 'comment_count' | 'share_count' | 'view_count'>
        Update: Partial<Omit<Video, 'id'>>
      }
      follows: {
        Row: Follow
        Insert: Omit<Follow, 'created_at'>
        Update: never
      }
      likes: {
        Row: Like
        Insert: Omit<Like, 'created_at'>
        Update: never
      }
      comments: {
        Row: Comment
        Insert: Omit<Comment, 'created_at' | 'updated_at' | 'like_count'>
        Update: Partial<Omit<Comment, 'id'>>
      }
      bookmarks: {
        Row: Bookmark
        Insert: Omit<Bookmark, 'created_at'>
        Update: never
      }
      hashtags: {
        Row: Hashtag
        Insert: Omit<Hashtag, 'created_at' | 'video_count'>
        Update: Partial<Omit<Hashtag, 'id'>>
      }
      video_hashtags: {
        Row: VideoHashtag
        Insert: VideoHashtag
        Update: never
      }
      products: {
        Row: Product
        Insert: Omit<Product, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Product, 'id'>>
      }
      stores: {
        Row: Store
        Insert: Omit<Store, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Store, 'id'>>
      }
      orders: {
        Row: Order
        Insert: Omit<Order, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Order, 'id'>>
      }
      notifications: {
        Row: Notification
        Insert: Omit<Notification, 'created_at'>
        Update: Partial<Omit<Notification, 'id'>>
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}

export interface User {
  id: string
  clerk_id: string
  username: string
  display_name: string
  avatar_url: string | null
  bio: string | null
  website: string | null
  is_verified: boolean
  is_seller: boolean
  follower_count: number
  following_count: number
  video_count: number
  like_count: number
  created_at: string
  updated_at: string
}

export interface Video {
  id: string
  user_id: string
  title: string | null
  caption: string
  video_url: string
  thumbnail_url: string | null
  duration: number
  width: number
  height: number
  like_count: number
  comment_count: number
  share_count: number
  view_count: number
  bookmark_count: number
  status: 'processing' | 'ready' | 'failed'
  privacy: 'public' | 'friends' | 'private'
  allow_comments: boolean
  allow_duet: boolean
  allow_stitch: boolean
  is_pinned: boolean
  scheduled_at: string | null
  published_at: string | null
  created_at: string
  updated_at: string
  // Joined fields
  user?: User
  hashtags?: Hashtag[]
  is_liked?: boolean
  is_bookmarked?: boolean
}

export interface Follow {
  follower_id: string
  following_id: string
  created_at: string
}

export interface Like {
  user_id: string
  video_id: string
  created_at: string
}

export interface Comment {
  id: string
  user_id: string
  video_id: string
  parent_id: string | null
  content: string
  like_count: number
  created_at: string
  updated_at: string
  user?: User
  replies?: Comment[]
}

export interface Bookmark {
  user_id: string
  video_id: string
  created_at: string
}

export interface Hashtag {
  id: string
  name: string
  video_count: number
  created_at: string
}

export interface VideoHashtag {
  video_id: string
  hashtag_id: string
}

export interface Product {
  id: string
  store_id: string
  name: string
  description: string
  price: number
  sale_price: number | null
  images: string[]
  category: string
  inventory: number
  sold_count: number
  rating: number
  review_count: number
  is_active: boolean
  created_at: string
  updated_at: string
  store?: Store
}

export interface Store {
  id: string
  user_id: string
  name: string
  description: string | null
  logo_url: string | null
  banner_url: string | null
  stripe_account_id: string | null
  is_verified: boolean
  follower_count: number
  product_count: number
  rating: number
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  buyer_id: string
  store_id: string
  stripe_payment_intent: string | null
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'returned' | 'cancelled'
  subtotal: number
  shipping_cost: number
  tax: number
  total: number
  shipping_address: Json
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  actor_id: string | null
  type: 'like' | 'comment' | 'follow' | 'mention' | 'share' | 'order_update' | 'live_start'
  entity_id: string | null
  entity_type: 'video' | 'comment' | 'order' | 'live' | null
  message: string
  is_read: boolean
  created_at: string
  actor?: User
}
