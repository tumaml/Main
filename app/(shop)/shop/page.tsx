'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, Search, Zap, ChevronRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useCartStore } from '@/store/cart'
import { ProductCard, ProductCardSkeleton } from '@/components/shop/ProductCard'
import { Product } from '@/types/database'
import { cn } from '@/lib/utils'

const CATEGORIES = [
  { name: 'All', emoji: '🛍️' },
  { name: 'Beauty', emoji: '💄' },
  { name: 'Fashion', emoji: '👗' },
  { name: 'Electronics', emoji: '📱' },
  { name: 'Home & Garden', emoji: '🏠' },
  { name: 'Food & Beverage', emoji: '🍜' },
  { name: 'Sports', emoji: '⚽' },
  { name: 'Services', emoji: '🔧' },
]

async function fetchProducts(params: URLSearchParams): Promise<Product[]> {
  const res = await fetch(`/api/products?${params}`)
  if (!res.ok) return []
  const data = await res.json() as { products: Product[] }
  return data.products ?? []
}

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const totalItems = useCartStore((s) => s.totalItems())

  const categoryParam = activeCategory !== 'All' ? activeCategory : ''

  const { data: flashDeals = [], isLoading: flashLoading } = useQuery({
    queryKey: ['products', 'flash', categoryParam],
    queryFn: () => {
      const params = new URLSearchParams({ sort: 'trending', limit: '6' })
      if (categoryParam) params.set('category', categoryParam)
      return fetchProducts(params)
    },
  })

  const { data: trending = [], isLoading: trendingLoading } = useQuery({
    queryKey: ['products', 'trending', categoryParam],
    queryFn: () => {
      const params = new URLSearchParams({ sort: 'newest', limit: '8' })
      if (categoryParam) params.set('category', categoryParam)
      return fetchProducts(params)
    },
  })

  // Filter flash deals: those with compare_price (discounted)
  const deals = flashDeals.filter((p) => p.compare_price != null).slice(0, 6)
  // If no deals, show all trending products as flash deals
  const displayDeals = deals.length > 0 ? deals : flashDeals.slice(0, 4)

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-black border-b border-white/10 px-4 pt-safe">
        <div className="flex items-center justify-between py-3">
          <h1 className="text-white font-bold text-xl">Shop</h1>
          <div className="flex items-center gap-3">
            <Link href="/discover?q=">
              <Search className="w-5 h-5 text-white" />
            </Link>
            <Link href="/shop/cart" className="relative">
              <ShoppingCart className="w-5 h-5 text-white" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#FE2C55] rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-3">
          {CATEGORIES.map(({ name, emoji }) => (
            <button
              key={name}
              onClick={() => setActiveCategory(name)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0',
                activeCategory === name
                  ? 'bg-[#FE2C55] text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/15'
              )}
            >
              {emoji} {name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6 px-4 pt-4">
        {/* Flash Deals */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <h2 className="text-white font-bold text-base">Flash Deals</h2>
            </div>
            <div className="flex items-center gap-1 bg-black/60 border border-white/10 rounded-lg px-2 py-1">
              <span className="text-xs font-mono text-white">02:00:00</span>
            </div>
          </div>

          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
            {flashLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <ProductCardSkeleton key={i} variant="horizontal" />
                ))
              : displayDeals.map((product) => (
                  <ProductCard key={product.id} product={product} variant="horizontal" />
                ))}
          </div>
        </section>

        {/* Trending */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-bold text-base">🔥 Trending</h2>
            <button className="text-[#69C9D0] text-sm flex items-center gap-0.5">
              See all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {trendingLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : trending.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {trending.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <p className="text-white/40 text-sm">No products yet</p>
              <Link
                href="/create"
                className="bg-[#FE2C55] text-white text-sm font-bold px-4 py-2 rounded-full hover:bg-[#e01f45] transition-colors"
              >
                List your first product
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
