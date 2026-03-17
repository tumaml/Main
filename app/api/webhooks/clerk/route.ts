import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

// Clerk webhook to sync user creation/updates to Supabase
// Set up in Clerk Dashboard: Webhooks → Add endpoint → /api/webhooks/clerk
// Events: user.created, user.updated, user.deleted

export async function POST(request: NextRequest) {
  const payload = await request.json()
  const { type, data } = payload

  const supabase = createServerSupabase()

  if (type === 'user.created') {
    const username =
      data.username ||
      data.email_addresses?.[0]?.email_address?.split('@')[0] ||
      `user_${data.id.slice(-6)}`

    await supabase.from('users').insert({
      clerk_id: data.id,
      username: username.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
      display_name: [data.first_name, data.last_name].filter(Boolean).join(' ') || username,
      avatar_url: data.image_url || null,
    })
  }

  if (type === 'user.updated') {
    const updates: Record<string, any> = {}
    if (data.image_url) updates.avatar_url = data.image_url
    const name = [data.first_name, data.last_name].filter(Boolean).join(' ')
    if (name) updates.display_name = name

    if (Object.keys(updates).length > 0) {
      await supabase.from('users').update(updates).eq('clerk_id', data.id)
    }
  }

  if (type === 'user.deleted') {
    await supabase.from('users').delete().eq('clerk_id', data.id)
  }

  return NextResponse.json({ received: true })
}
