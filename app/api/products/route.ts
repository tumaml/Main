import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category     = searchParams.get('category')
  const q            = searchParams.get('q')
  const sort         = searchParams.get('sort') || 'trending'
  const listingType  = searchParams.get('listing_type')
  const limit        = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
  const cursor       = searchParams.get('cursor')

  const supabase = createServerSupabase()

  const orderCol = sort === 'newest' ? 'created_at' : sort === 'price_asc' || sort === 'price_desc' ? 'price' : 'sold_count'
  const ascending = sort === 'price_asc'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = supabase
    .from('products')
    .select('*, seller:users(id, username, display_name, avatar_url), store:stores(id, name, logo_url, rating)')
    .eq('is_active', true)
    .order(orderCol, { ascending })
    .limit(limit + 1)

  if (category && category !== 'All') query = query.eq('category', category)
  if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`)
  if (listingType) query = query.eq('listing_type', listingType)
  if (cursor) query = query.lt(orderCol, cursor)

  const { data: products, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const hasMore = (products?.length || 0) > limit
  const sliced = hasMore ? products!.slice(0, limit) : products || []

  return NextResponse.json({ products: sliced, hasMore })
}

export async function POST(request: NextRequest) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerSupabase()

  const { data: me } = await supabase.from('users').select('id').eq('clerk_id', clerkId).single()
  if (!me) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const body = await request.json() as {
    title: string
    description?: string
    price: number
    currency?: string
    category?: string
    listingType?: 'product' | 'service'
    condition?: 'new' | 'used' | 'refurbished'
    inventory?: number
    images?: string[]
  }

  if (!body.title || !body.price) {
    return NextResponse.json({ error: 'title and price required' }, { status: 400 })
  }

  const { data: product, error } = await supabase
    .from('products')
    .insert({
      seller_id:    (me as { id: string }).id,
      title:        body.title,
      description:  body.description ?? null,
      price:        body.price,
      currency:     body.currency ?? 'JOD',
      category:     body.category ?? null,
      listing_type: body.listingType ?? 'product',
      condition:    body.condition ?? 'new',
      inventory:    body.inventory ?? 0,
      images:       body.images ?? [],
      is_active:    true,
      is_digital:   false,
      tags:         [],
    } as never)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ product }, { status: 201 })
}
