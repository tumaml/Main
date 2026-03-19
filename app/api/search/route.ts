import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()
  const type = searchParams.get('type') || 'all'
  const limit = 20

  if (!q) return NextResponse.json({ videos: [], users: [] })

  const supabase = createServerSupabase()
  const pattern = `%${q}%`

  const [videosRes, usersRes] = await Promise.all([
    type === 'users'
      ? Promise.resolve({ data: [] })
      : supabase
          .from('videos')
          .select('id, caption, thumbnail_url, like_count, view_count, user:users(id, username, display_name, avatar_url)')
          .eq('privacy', 'public')
          .ilike('caption', pattern)
          .order('like_count', { ascending: false })
          .limit(limit),

    type === 'videos'
      ? Promise.resolve({ data: [] })
      : supabase
          .from('users')
          .select('id, username, display_name, avatar_url, is_verified, follower_count, video_count')
          .or(`username.ilike.${pattern},display_name.ilike.${pattern}`)
          .order('follower_count', { ascending: false })
          .limit(limit),
  ])

  return NextResponse.json({
    videos: videosRes.data || [],
    users: usersRes.data || [],
  })
}
