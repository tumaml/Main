import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tab = searchParams.get('tab') || 'fyp'
  const cursor = searchParams.get('cursor')
  const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 20)
  const userId = searchParams.get('userId')

  const supabase = createServerSupabase()
  const { userId: clerkId } = await auth()

  try {
    let query = supabase
      .from('videos')
      .select(`*, user:users(id, username, display_name, avatar_url, is_verified, follower_count)`)
      .eq('status', 'ready')
      .eq('privacy', 'public')
      .order('published_at', { ascending: false })
      .limit(limit + 1)

    if (userId) query = (query as any).eq('user_id', userId)
    if (cursor) query = (query as any).lt('published_at', cursor)

    if (tab === 'following' && clerkId) {
      const { data: userProfile } = await supabase
        .from('users').select('id').eq('clerk_id', clerkId).single()

      if (userProfile) {
        const { data: following } = await supabase
          .from('follows').select('following_id').eq('follower_id', (userProfile as any).id)

        const followingIds = (following || []).map((f: any) => f.following_id)
        if (followingIds.length === 0) {
          return NextResponse.json({ videos: [], nextCursor: null })
        }
        query = (query as any).in('user_id', followingIds)
      }
    }

    const { data: videos, error } = await query
    if (error) throw error

    const hasMore = (videos?.length || 0) > limit
    const slicedVideos = hasMore ? videos!.slice(0, limit) : videos || []
    const nextCursor = hasMore
      ? (slicedVideos[slicedVideos.length - 1] as any)?.published_at
      : null

    if (clerkId && slicedVideos.length > 0) {
      const { data: userProfile } = await supabase
        .from('users').select('id').eq('clerk_id', clerkId).single()

      if (userProfile) {
        const videoIds = slicedVideos.map((v: any) => v.id)
        const uid = (userProfile as any).id

        const [{ data: likes }, { data: bookmarks }] = await Promise.all([
          supabase.from('likes').select('video_id').eq('user_id', uid).in('video_id', videoIds),
          supabase.from('bookmarks').select('video_id').eq('user_id', uid).in('video_id', videoIds),
        ])

        const likedSet = new Set((likes || []).map((l: any) => l.video_id))
        const bookmarkedSet = new Set((bookmarks || []).map((b: any) => b.video_id))

        slicedVideos.forEach((v: any) => {
          v.is_liked = likedSet.has(v.id)
          v.is_bookmarked = bookmarkedSet.has(v.id)
        })
      }
    }

    return NextResponse.json({ videos: slicedVideos, nextCursor })
  } catch (error) {
    console.error('GET /api/videos error:', error)
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerSupabase()

  try {
    const body = await request.json()
    const { videoUrl, thumbnailUrl, caption, duration, width, height, privacy } = body

    const { data: userProfile } = await supabase
      .from('users').select('id').eq('clerk_id', clerkId).single()

    if (!userProfile) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const { data: video, error } = await supabase
      .from('videos')
      .insert({
        user_id: (userProfile as any).id,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl || null,
        caption: caption || '',
        duration: duration || 0,
        width: width || 1080,
        height: height || 1920,
        privacy: privacy || 'public',
        status: 'ready',
      } as any)
      .select('*, user:users(id, username, display_name, avatar_url)')
      .single()

    if (error) throw error
    return NextResponse.json({ video }, { status: 201 })
  } catch (error) {
    console.error('POST /api/videos error:', error)
    return NextResponse.json({ error: 'Failed to create video' }, { status: 500 })
  }
}
