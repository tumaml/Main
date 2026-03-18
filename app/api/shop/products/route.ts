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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = supabase
    .from('products')
    .select('*, store:stores(id, name, logo_url, is_verified, rating)')
    .eq('is_active', true)
    .order('sold_count', { ascending: false })
    .limit(limit + 1)

  if (category) query = query.eq('category', category)
  if (storeId) query = query.eq('store_id', storeId)
  if (cursor) query = query.lt('sold_count', parseInt(cursor))

  const { data: products, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const hasMore = (products?.length ?? 0) > limit
  const sliced: unknown[] = hasMore ? products!.slice(0, limit) : products ?? []

  return NextResponse.json({
    products: sliced,
    nextCursor: hasMore ? (sliced[sliced.length - 1] as Record<string, unknown>)?.sold_count : null,
  })
}

export async function POST(request: NextRequest) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerSupabase()
  const body = await request.json() as {
    name: string
    description?: string
    price: number
    salePrice?: number
    images?: string[]
    category?: string
    inventory?: number
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: user } = await (supabase.from('users').select('id').eq('clerk_id', clerkId).single() as any)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: store } = await (supabase
    .from('stores')
    .select('id')
    .eq('user_id', (user as Record<string, string>).id)
    .single() as any)

  if (!store) {
    return NextResponse.json(
      { error: 'No store found. Please set up your store first.' },
      { status: 400 }
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: product, error } = await (supabase
    .from('products')
    .insert({
      store_id: (store as Record<string, string>).id,
      name: body.name,
      description: body.description ?? '',
      price: body.price,
      sale_price: body.salePrice ?? null,
      images: body.images ?? [],
      category: body.category ?? 'other',
      inventory: body.inventory ?? 0,
    })
    .select()
    .single() as any)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ product }, { status: 201 })
}
