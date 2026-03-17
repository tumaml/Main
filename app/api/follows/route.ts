import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerSupabase()
  const { targetUserId } = await request.json()

  const { data: user } = await supabase.from('users').select('id').eq('clerk_id', clerkId).single()
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const userId = (user as any).id
  if (userId === targetUserId) return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 })

  await supabase.from('follows').insert({ follower_id: userId, following_id: targetUserId } as any)

  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerSupabase()
  const { targetUserId } = await request.json()

  const { data: user } = await supabase.from('users').select('id').eq('clerk_id', clerkId).single()
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  await supabase
    .from('follows')
    .delete()
    .eq('follower_id', (user as any).id)
    .eq('following_id', targetUserId)

  return NextResponse.json({ success: true })
}
