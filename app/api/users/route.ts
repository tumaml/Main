import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const username = searchParams.get('username')
  const clerkId = searchParams.get('clerkId')

  const supabase = createServerSupabase()

  if (username) {
    const { data, error } = await supabase.from('users').select('*').eq('username', username).single()
    if (error) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    return NextResponse.json({ user: data })
  } else if (clerkId) {
    const { data, error } = await supabase.from('users').select('*').eq('clerk_id', clerkId).single()
    if (error) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    return NextResponse.json({ user: data })
  }

  return NextResponse.json({ error: 'username or clerkId required' }, { status: 400 })
}

export async function PUT(request: NextRequest) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerSupabase()
  const body = await request.json()
  const { username, displayName, bio, website, avatarUrl } = body

  if (username) {
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .neq('clerk_id', clerkId)
      .single()

    if (existing) return NextResponse.json({ error: 'Username already taken' }, { status: 400 })
  }

  const updates: Record<string, any> = {}
  if (username) updates.username = username
  if (displayName) updates.display_name = displayName
  if (bio !== undefined) updates.bio = bio
  if (website !== undefined) updates.website = website
  if (avatarUrl) updates.avatar_url = avatarUrl

  const { data: user, error } = await supabase
    .from('users')
    .update(updates as any)
    .eq('clerk_id', clerkId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ user })
}
