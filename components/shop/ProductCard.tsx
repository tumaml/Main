'use client'

import Link from 'next/link'
import { Star } from 'lucide-react'
import { Product } from '@/types/database'
import { formatPrice, formatCount } from '@/lib/utils'

interface ProductCardProps {
  product: Product
  variant?: 'grid' | 'horizontal'
}

export function ProductCard({ product, variant = 'grid' }: ProductCardProps) {
  const image = product.images?.[0] ?? `https://picsum.photos/seed/${product.id}/400/400`
  const discount = product.compare_price
    ? Math.round((1 - product.price / product.compare_price) * 100)
    : null

  if (variant === 'horizontal') {
    return (
      <Link href={`/shop/product/${product.id}`}>
        <div className="w-40 flex-shrink-0 bg-white/5 rounded-2xl overflow-hidden border border-white/10 active:scale-95 transition-transform">
          <div className="relative">
            <img src={image} alt={product.title} className="w-full h-40 object-cover" />
            {discount && (
              <span className="absolute top-2 left-2 bg-[#FE2C55] text-white text-xs font-bold px-1.5 py-0.5 rounded-md">
                -{discount}%
              </span>
            )}
          </div>
          <div className="p-2.5 space-y-1">
            <p className="text-white text-xs font-medium line-clamp-2 leading-tight">{product.title}</p>
            <div className="flex items-center gap-1">
              <span className="text-[#FE2C55] font-bold text-sm">{formatPrice(product.price)}</span>
              {product.compare_price && (
                <span className="text-white/30 text-xs line-through">{formatPrice(product.compare_price)}</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span className="text-white/60 text-xs">
                {product.rating.toFixed(1)} · {formatCount(product.sold_count)} sold
              </span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/shop/product/${product.id}`}>
      <div className="bg-white/5 rounded-2xl overflow-hidden border border-white/10 active:scale-95 transition-transform">
        <div className="relative">
          <img src={image} alt={product.title} className="w-full aspect-square object-cover" />
          {discount && (
            <span className="absolute top-2 left-2 bg-[#FE2C55] text-white text-xs font-bold px-1.5 py-0.5 rounded-md">
              -{discount}%
            </span>
          )}
        </div>
        <div className="p-2.5 space-y-1">
          <p className="text-white text-xs font-medium line-clamp-2 leading-tight">{product.title}</p>
          {product.store && (
            <p className="text-white/40 text-[10px]">{(product.store as { name: string }).name}</p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-white font-bold text-sm">{formatPrice(product.price)}</span>
            <div className="flex items-center gap-0.5">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span className="text-white/50 text-xs">{product.rating.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export function ProductCardSkeleton({ variant = 'grid' }: { variant?: 'grid' | 'horizontal' }) {
  if (variant === 'horizontal') {
    return (
      <div className="w-40 flex-shrink-0 bg-white/5 rounded-2xl overflow-hidden border border-white/10 animate-pulse">
        <div className="w-full h-40 bg-white/10" />
        <div className="p-2.5 space-y-2">
          <div className="h-3 bg-white/10 rounded w-3/4" />
          <div className="h-3 bg-white/10 rounded w-1/2" />
        </div>
      </div>
    )
  }
  return (
    <div className="bg-white/5 rounded-2xl overflow-hidden border border-white/10 animate-pulse">
      <div className="aspect-square bg-white/10" />
      <div className="p-2.5 space-y-2">
        <div className="h-3 bg-white/10 rounded w-3/4" />
        <div className="h-3 bg-white/10 rounded w-1/2" />
      </div>
    </div>
  )
}
