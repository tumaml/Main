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

  await supabase.from('video_likes').insert({ user_id: (user as any).id, video_id: videoId })

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
    .from('video_likes')
    .delete()
    .eq('user_id', (user as any).id)
    .eq('video_id', videoId)

  return NextResponse.json({ success: true })
}
