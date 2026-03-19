import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerSupabase()
  const { videoId, productId, position = 0 } = await request.json() as {
    videoId: string
    productId: string
    position?: number
  }

  if (!videoId || !productId) {
    return NextResponse.json({ error: 'videoId and productId required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('video_products')
    .insert({ video_id: videoId, product_id: productId, position } as never)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true }, { status: 201 })
}
