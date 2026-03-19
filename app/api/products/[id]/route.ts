import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

interface Params {
  params: { id: string }
}

export async function GET(_request: NextRequest, { params }: Params) {
  const supabase = createServerSupabase()

  const { data: product, error } = await supabase
    .from('products')
    .select('*, seller:users(id, username, display_name, avatar_url, is_verified), store:stores(id, name, logo_url, banner_url, rating, review_count, sale_count)')
    .eq('id', params.id)
    .single()

  if (error || !product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

  // Fetch recent reviews
  const { data: reviews } = await supabase
    .from('product_reviews')
    .select('*, user:users(id, username, avatar_url)')
    .eq('product_id', params.id)
    .order('created_at', { ascending: false })
    .limit(5)

  return NextResponse.json({ product, reviews: reviews || [] })
}
