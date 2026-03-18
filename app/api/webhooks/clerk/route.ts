import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { createServerSupabase } from '@/lib/supabase'

// Clerk webhook — syncs user lifecycle events to Supabase
// Dashboard setup: Clerk → Webhooks → Add endpoint → /api/webhooks/clerk
// Events to enable: user.created, user.updated, user.deleted
// Set CLERK_WEBHOOK_SECRET env var to the signing secret from Clerk dashboard

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET

  if (!webhookSecret || webhookSecret === 'ENV_MISSING') {
    // Dev mode without secret: skip signature check (not safe for production)
    const payload = await request.json() as { type: string; data: Record<string, unknown> }
    return handlePayload(payload)
  }

  const svixId        = request.headers.get('svix-id')
  const svixTimestamp = request.headers.get('svix-timestamp')
  const svixSignature = request.headers.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 })
  }

  const body = await request.text()
  const wh = new Webhook(webhookSecret)

  let payload: { type: string; data: Record<string, unknown> }
  try {
    payload = wh.verify(body, {
      'svix-id':        svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as typeof payload
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  return handlePayload(payload)
}

async function handlePayload(payload: { type: string; data: Record<string, unknown> }) {
  const { type, data } = payload
  const supabase = createServerSupabase()

  if (type === 'user.created') {
    const emailAddresses = data.email_addresses as Array<{ email_address: string }> | undefined
    const rawUsername =
      (data.username as string | null) ??
      emailAddresses?.[0]?.email_address?.split('@')[0] ??
      `user_${(data.id as string).slice(-6)}`

    const username = rawUsername.toLowerCase().replace(/[^a-z0-9_]/g, '_')
    const firstName = data.first_name as string | null
    const lastName  = data.last_name  as string | null
    const displayName = [firstName, lastName].filter(Boolean).join(' ') || username

    const { error } = await supabase.from('users').insert({
      clerk_id:     data.id as string,
      username,
      display_name: displayName,
      avatar_url:   (data.image_url as string | null) ?? null,
    })

    if (error) {
      console.error('[clerk webhook] user.created insert failed:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  if (type === 'user.updated') {
    const updates: Record<string, string | null> = {}
    const imageUrl = data.image_url as string | null
    if (imageUrl) updates.avatar_url = imageUrl
    const firstName = data.first_name as string | null
    const lastName  = data.last_name  as string | null
    const name = [firstName, lastName].filter(Boolean).join(' ')
    if (name) updates.display_name = name

    if (Object.keys(updates).length > 0) {
      await supabase.from('users').update(updates).eq('clerk_id', data.id as string)
    }
  }

  if (type === 'user.deleted') {
    await supabase.from('users').delete().eq('clerk_id', data.id as string)
  }

  return NextResponse.json({ received: true })
}
