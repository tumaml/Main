import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const storeId = searchParams.get('storeId')
  const cursor = searchParams.get('cursor')
  const limit = 20

  const supabase = createServerSupabase()

  let query = supabase
    .from('products')
    .select('*, store:stores(id, name, logo_url, is_verified, rating)')
    .eq('is_active', true)
    .order('sold_count', { ascending: false })
    .limit(limit + 1)

  if (category) query = (query as any).eq('category', category)
  if (storeId) query = (query as any).eq('store_id', storeId)
  if (cursor) query = (query as any).lt('sold_count', parseInt(cursor))

  const { data: products, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const hasMore = (products?.length || 0) > limit
  const sliced = hasMore ? products!.slice(0, limit) : products || []

  return NextResponse.json({
    products: sliced,
    nextCursor: hasMore ? (sliced[sliced.length - 1] as any)?.sold_count : null,
  })
}

export async function POST(request: NextRequest) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerSupabase()
  const body = await request.json()

  const { data: user } = await supabase.from('users').select('id').eq('clerk_id', clerkId).single()
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { data: store } = await supabase
    .from('stores').select('id').eq('user_id', (user as any).id).single()
  if (!store) {
    return NextResponse.json({ error: 'No store found. Please set up your store first.' }, { status: 400 })
  }

  const { data: product, error } = await supabase
    .from('products')
    .insert({
      store_id: (store as any).id,
      name: body.name,
      description: body.description || '',
      price: body.price,
      sale_price: body.salePrice || null,
      images: body.images || [],
      category: body.category || 'other',
      inventory: body.inventory || 0,
    } as any)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ product }, { status: 201 })
}
