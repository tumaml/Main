'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Search, Star, Zap, ChevronRight } from 'lucide-react'
import { BottomNav } from '@/components/layout/BottomNav'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCartStore } from '@/store/cart'
import { formatPrice, formatCount } from '@/lib/utils'
import { cn } from '@/lib/utils'

const CATEGORIES = [
  { name: 'All', emoji: '🛍️' },
  { name: 'Beauty', emoji: '💄' },
  { name: 'Fashion', emoji: '👗' },
  { name: 'Electronics', emoji: '📱' },
  { name: 'Home', emoji: '🏠' },
  { name: 'Food', emoji: '🍜' },
  { name: 'Sports', emoji: '⚽' },
]

const FLASH_DEALS = [
  {
    id: '1',
    name: 'Glazed Donut Lip Oil',
    price: 899,
    originalPrice: 1499,
    image: 'https://picsum.photos/seed/lip1/400/400',
    rating: 4.9,
    sold: 2341,
    endsIn: 7200,
  },
  {
    id: '2',
    name: 'Y2K Butterfly Crop Top',
    price: 1799,
    originalPrice: 2999,
    image: 'https://picsum.photos/seed/top1/400/400',
    rating: 4.7,
    sold: 892,
    endsIn: 3600,
  },
  {
    id: '3',
    name: 'Portable LED Ring Light',
    price: 1299,
    originalPrice: 2499,
    image: 'https://picsum.photos/seed/led1/400/400',
    rating: 4.6,
    sold: 1203,
    endsIn: 10800,
  },
]

const TRENDING_PRODUCTS = [
  {
    id: '4',
    name: 'Viral TikTok Cleansing Balm',
    price: 2199,
    image: 'https://picsum.photos/seed/balm/400/400',
    rating: 4.8,
    sold: 8920,
    store: 'K-Beauty Official',
  },
  {
    id: '5',
    name: 'Aesthetic Desk Lamp',
    price: 3499,
    image: 'https://picsum.photos/seed/lamp/400/400',
    rating: 4.5,
    sold: 3421,
    store: 'DeskVibe',
  },
  {
    id: '6',
    name: 'Cottagecore Dress',
    price: 4599,
    image: 'https://picsum.photos/seed/dress/400/400',
    rating: 4.6,
    sold: 1892,
    store: 'Vintage Finds',
  },
  {
    id: '7',
    name: 'Spicy Ramen Kit x3',
    price: 1599,
    image: 'https://picsum.photos/seed/ramen/400/400',
    rating: 4.9,
    sold: 12043,
    store: 'Noodle Box',
  },
]

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [countdown, setCountdown] = useState({ h: 2, m: 0, s: 0 })
  const totalItems = useCartStore((s) => s.totalItems())

  return (
    <div className="min-h-[100dvh] bg-black pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-black border-b border-white/10 px-4 pt-safe">
        <div className="flex items-center justify-between py-3">
          <h1 className="text-white font-bold text-xl">Shop</h1>
          <div className="flex items-center gap-3">
            <button>
              <Search className="w-5 h-5 text-white" />
            </button>
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
              {['02', '00', '00'].map((t, i) => (
                <span key={i} className={cn('text-xs font-mono text-white', i < 2 && 'after:content-[":"] after:mx-0.5')}>
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
            {FLASH_DEALS.map((deal) => (
              <FlashDealCard key={deal.id} deal={deal} />
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
          <div className="grid grid-cols-2 gap-3">
            {TRENDING_PRODUCTS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </div>

      <BottomNav />
    </div>
  )
}

function FlashDealCard({ deal }: { deal: typeof FLASH_DEALS[0] }) {
  const { addItem } = useCartStore()
  const discount = Math.round((1 - deal.price / deal.originalPrice) * 100)

  return (
    <div className="w-40 flex-shrink-0 bg-white/5 rounded-2xl overflow-hidden border border-white/10">
      <div className="relative">
        <img src={deal.image} alt={deal.name} className="w-full h-40 object-cover" />
        <span className="absolute top-2 left-2 bg-[#FE2C55] text-white text-xs font-bold px-1.5 py-0.5 rounded-md">
          -{discount}%
        </span>
      </div>
      <div className="p-2.5 space-y-1">
        <p className="text-white text-xs font-medium line-clamp-2 leading-tight">{deal.name}</p>
        <div className="flex items-center gap-1">
          <span className="text-[#FE2C55] font-bold text-sm">{formatPrice(deal.price)}</span>
          <span className="text-white/30 text-xs line-through">{formatPrice(deal.originalPrice)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          <span className="text-white/60 text-xs">{deal.rating} · {formatCount(deal.sold)} sold</span>
        </div>
        <button className="w-full bg-[#FE2C55] text-white text-xs font-bold py-1.5 rounded-lg hover:bg-[#e01f45] transition-colors">
          Add to Cart
        </button>
      </div>
    </div>
  )
}

function ProductCard({ product }: { product: typeof TRENDING_PRODUCTS[0] }) {
  return (
    <Link href={`/shop/product/${product.id}`}>
      <div className="bg-white/5 rounded-2xl overflow-hidden border border-white/10 active:scale-95 transition-transform">
        <img src={product.image} alt={product.name} className="w-full aspect-square object-cover" />
        <div className="p-2.5 space-y-1">
          <p className="text-white text-xs font-medium line-clamp-2 leading-tight">{product.name}</p>
          <p className="text-white/40 text-[10px]">{product.store}</p>
          <div className="flex items-center justify-between">
            <span className="text-white font-bold text-sm">{formatPrice(product.price)}</span>
            <div className="flex items-center gap-0.5">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span className="text-white/50 text-xs">{product.rating}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
