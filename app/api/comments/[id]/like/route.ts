import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'

interface Params {
  params: { id: string }
}

export async function POST(_request: NextRequest, { params }: Params) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerSupabase()

  const { data: me } = await supabase
    .from('users').select('id').eq('clerk_id', clerkId).single()
  if (!me) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const userId = (me as { id: string }).id
  const commentId = params.id

  // Check if already liked
  const { data: existing } = await supabase
    .from('comment_likes')
    .select('user_id')
    .eq('user_id', userId)
    .eq('comment_id', commentId)
    .single()

  if (existing) {
    // Unlike
    await supabase
      .from('comment_likes')
      .delete()
      .eq('user_id', userId)
      .eq('comment_id', commentId)

    await supabase.rpc('decrement_comment_likes', { comment_id: commentId }).catch(() => {
      // RPC may not exist; fallback to raw update
      supabase
        .from('comments')
        .update({ like_count: 0 } as never)
        .eq('id', commentId)
    })

    return NextResponse.json({ liked: false })
  } else {
    // Like
    await supabase
      .from('comment_likes')
      .insert({ user_id: userId, comment_id: commentId } as never)

    return NextResponse.json({ liked: true })
  }
}
