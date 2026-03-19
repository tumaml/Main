import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const q = searchParams.get('q')
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
  const cursor = searchParams.get('cursor')

  const supabase = createServerSupabase()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = supabase
    .from('products')
    .select('*, seller:users(id, username, display_name, avatar_url), store:stores(id, name, logo_url, rating)')
    .eq('is_active', true)
    .order('sold_count', { ascending: false })
    .limit(limit + 1)

  if (category) query = query.eq('category', category)
  if (q) query = query.ilike('title', `%${q}%`)
  if (cursor) query = query.lt('sold_count', parseInt(cursor))

  const { data: products, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const hasMore = (products?.length || 0) > limit
  const sliced = hasMore ? products!.slice(0, limit) : products || []

  return NextResponse.json({ products: sliced, hasMore })
}
