import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const videoId = searchParams.get('videoId')
  const cursor = searchParams.get('cursor')
  const limit = 20

  if (!videoId) return NextResponse.json({ error: 'videoId required' }, { status: 400 })

  const supabase = createServerSupabase()

  let query = supabase
    .from('comments')
    .select('*, user:users(id, username, display_name, avatar_url, is_verified)')
    .eq('video_id', videoId)
    .is('parent_id', null)
    .order('created_at', { ascending: false })
    .limit(limit + 1)

  if (cursor) query = (query as any).lt('created_at', cursor)

  const { data: comments, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const hasMore = (comments?.length || 0) > limit
  const sliced = hasMore ? comments!.slice(0, limit) : comments || []

  return NextResponse.json({
    comments: sliced,
    nextCursor: hasMore ? (sliced[sliced.length - 1] as any)?.created_at : null,
  })
}

export async function POST(request: NextRequest) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerSupabase()
  const { videoId, content, parentId } = await request.json()

  if (!content?.trim()) return NextResponse.json({ error: 'Content required' }, { status: 400 })

  const { data: user } = await supabase.from('users').select('id').eq('clerk_id', clerkId).single()
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { data: comment, error } = await supabase
    .from('comments')
    .insert({
      user_id: (user as any).id,
      video_id: videoId,
      content: content.trim(),
      parent_id: parentId || null,
    } as any)
    .select('*, user:users(id, username, display_name, avatar_url, is_verified)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ comment }, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerSupabase()
  const { searchParams } = new URL(request.url)
  const commentId = searchParams.get('id')

  if (!commentId) return NextResponse.json({ error: 'Comment ID required' }, { status: 400 })

  const { data: user } = await supabase.from('users').select('id').eq('clerk_id', clerkId).single()
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', (user as any).id)

  return NextResponse.json({ success: true })
}
