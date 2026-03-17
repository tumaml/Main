import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerSupabase()
  const { videoId } = await request.json()

  const { data: user } = await supabase.from('users').select('id').eq('clerk_id', clerkId).single()
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  await supabase.from('bookmarks').insert({ user_id: (user as any).id, video_id: videoId } as any)

  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerSupabase()
  const { videoId } = await request.json()

  const { data: user } = await supabase.from('users').select('id').eq('clerk_id', clerkId).single()
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  await supabase
    .from('bookmarks')
    .delete()
    .eq('user_id', (user as any).id)
    .eq('video_id', videoId)

  return NextResponse.json({ success: true })
}

export async function GET(request: NextRequest) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerSupabase()

  const { data: user } = await supabase.from('users').select('id').eq('clerk_id', clerkId).single()
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { data: bookmarks, error } = await supabase
    .from('bookmarks')
    .select('video_id, videos(*, user:users(id, username, display_name, avatar_url))' as any)
    .eq('user_id', (user as any).id)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ bookmarks })
}
