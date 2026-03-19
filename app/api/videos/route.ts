import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tab          = searchParams.get('tab') || 'fyp'
  const cursor       = searchParams.get('cursor')
  const userId       = searchParams.get('userId')
  const limit        = Math.min(parseInt(searchParams.get('limit') || '10'), 20)
  const listingType  = searchParams.get('type')       // 'product' | 'service' | null
  const maxPrice     = searchParams.get('max_price')  // in cents
  const condition    = searchParams.get('condition')  // 'new' | 'used' | 'refurbished' | null

  const supabase = createServerSupabase()
  const { userId: clerkId } = await auth()

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query: any = supabase
      .from('videos')
      .select(`
        *,
        user:users(id, username, display_name, avatar_url, is_verified, follower_count),
        linked_product:video_products(
          product:products(id, title, price, compare_price, currency, images, listing_type, condition, rating, sold_count, is_active)
        )
      `)
      .eq('privacy', 'public')
      .order('created_at', { ascending: false })
      .limit(limit + 1)

    if (userId) query = query.eq('user_id', userId)
    if (cursor) query = query.lt('created_at', cursor)
    if (listingType) query = query.eq('listing_type', listingType)
    if (maxPrice) query = query.lte('price', parseInt(maxPrice))
    if (condition) query = query.eq('condition', condition)

    // For following/friends tabs, scope to relevant user IDs
    if ((tab === 'following' || tab === 'friends') && clerkId) {
      const { data: me } = await supabase
        .from('users').select('id').eq('clerk_id', clerkId).single()

      if (!me) return NextResponse.json({ videos: [], nextCursor: null })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const meId = (me as any).id

      if (tab === 'following') {
        const { data: follows } = await supabase
          .from('follows').select('following_id').eq('follower_id', meId)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ids = (follows || []).map((f: any) => f.following_id)
        if (ids.length === 0) return NextResponse.json({ videos: [], nextCursor: null })
        query = query.in('user_id', ids)
      }

      if (tab === 'friends') {
        // Friends = mutual follows
        const { data: iFollow } = await supabase
          .from('follows').select('following_id').eq('follower_id', meId)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const iFollowIds = (iFollow || []).map((f: any) => f.following_id)
        if (iFollowIds.length === 0) return NextResponse.json({ videos: [], nextCursor: null })

        const { data: followBack } = await supabase
          .from('follows')
          .select('follower_id')
          .eq('following_id', meId)
          .in('follower_id', iFollowIds)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const friendIds = (followBack || []).map((f: any) => f.follower_id)
        if (friendIds.length === 0) return NextResponse.json({ videos: [], nextCursor: null })
        query = query.in('user_id', friendIds)
      }
    }

    const { data: videos, error } = await query
    if (error) throw error

    const hasMore    = (videos?.length || 0) > limit
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sliced: any[] = hasMore ? videos!.slice(0, limit) : videos || []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nextCursor = hasMore ? (sliced[sliced.length - 1] as any)?.created_at : null

    // Annotate is_liked / is_bookmarked for the current user
    if (clerkId && sliced.length > 0) {
      const { data: me } = await supabase
        .from('users').select('id').eq('clerk_id', clerkId).single()

      if (me) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const meId = (me as any).id
        const videoIds = sliced.map((v) => v.id)

        const [{ data: likes }, { data: bookmarks }] = await Promise.all([
          supabase.from('video_likes').select('video_id').eq('user_id', meId).in('video_id', videoIds),
          supabase.from('bookmarks').select('video_id').eq('user_id', meId).in('video_id', videoIds),
        ])

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const likedSet      = new Set((likes || []).map((l: any) => l.video_id))
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const bookmarkedSet = new Set((bookmarks || []).map((b: any) => b.video_id))
        sliced.forEach((v) => {
          v.is_liked      = likedSet.has(v.id)
          v.is_bookmarked = bookmarkedSet.has(v.id)
        })
      }
    }

    // Flatten linked_product: video_products join returns array; take first product
    sliced.forEach((v) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = v.linked_product as any
      if (Array.isArray(raw) && raw.length > 0) {
        v.linked_product = raw[0]?.product ?? null
      } else {
        v.linked_product = null
      }
    })

    return NextResponse.json({ videos: sliced, nextCursor })
  } catch (err) {
    console.error('GET /api/videos error:', err)
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerSupabase()

  try {
    const body = await request.json() as {
      videoUrl: string
      thumbnailUrl?: string
      caption?: string
      duration?: number
      width?: number
      height?: number
      privacy?: 'public' | 'friends' | 'private'
      listingType?: 'product' | 'service'
      title?: string
      price?: number
      currency?: string
      condition?: 'new' | 'used' | 'refurbished'
      location?: string
    }

    const { data: me } = await supabase
      .from('users').select('id').eq('clerk_id', clerkId).single()
    if (!me) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const { data: video, error } = await supabase
      .from('videos')
      .insert({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        user_id:       (me as any).id,
        video_url:     body.videoUrl,
        thumbnail_url: body.thumbnailUrl ?? null,
        caption:       body.caption ?? '',
        duration:      body.duration ?? null,
        width:         body.width    ?? null,
        height:        body.height   ?? null,
        privacy:       body.privacy  ?? 'public',
        listing_type:  body.listingType  ?? null,
        title:         body.title        ?? null,
        price:         body.price        ?? null,
        currency:      body.currency     ?? 'JOD',
        condition:     body.condition    ?? null,
        location:      body.location     ?? null,
      } as never)
      .select('*, user:users(id, username, display_name, avatar_url)')
      .single()

    if (error) throw error
    return NextResponse.json({ video }, { status: 201 })
  } catch (err) {
    console.error('POST /api/videos error:', err)
    return NextResponse.json({ error: 'Failed to create video' }, { status: 500 })
  }
}
