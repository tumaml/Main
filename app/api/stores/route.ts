import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'

export async function GET(_request: NextRequest) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerSupabase()

  const { data: me } = await supabase
    .from('users').select('id').eq('clerk_id', clerkId).single()
  if (!me) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('user_id', (me as { id: string }).id)
    .single()

  return NextResponse.json({ store: store ?? null })
}

export async function POST(request: NextRequest) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerSupabase()

  const { data: me } = await supabase
    .from('users').select('id, display_name').eq('clerk_id', clerkId).single()
  if (!me) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const body = await request.json() as { name?: string }
  const userId = (me as { id: string; display_name: string }).id
  const name = body.name ?? `${(me as { id: string; display_name: string }).display_name}'s Shop`

  // Upsert so duplicate calls are idempotent
  const { data: store, error } = await supabase
    .from('stores')
    .upsert({ user_id: userId, name } as never, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ store }, { status: 201 })
}
