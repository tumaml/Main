'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  ShoppingCart,
  Heart,
  Share2,
  Star,
  Shield,
  Truck,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/shared/avatar'
import { Skeleton } from '@/components/shared/skeleton'
import { useCartStore } from '@/store/cart'
import { formatPrice, formatCount } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Product, ProductReview } from '@/types/database'

// Fallback static products matching the demo IDs on the shop page
const STATIC_PRODUCTS: Record<string, Partial<Product>> = {
  '1': { id: '1', title: 'Glazed Donut Lip Oil', price: 899, compare_price: 1499, images: ['https://picsum.photos/seed/lip1/600/600'], rating: 4.9, review_count: 324, sold_count: 2341, category: 'Beauty', description: 'A nourishing lip oil with a glossy glazed donut finish. Infused with vitamin E and jojoba oil for all-day hydration and shine.', tags: ['lip', 'beauty', 'viral'] },
  '2': { id: '2', title: 'Y2K Butterfly Crop Top', price: 1799, compare_price: 2999, images: ['https://picsum.photos/seed/top1/600/600'], rating: 4.7, review_count: 187, sold_count: 892, category: 'Fashion', description: 'Channel Y2K vibes with this butterfly-print crop top. Made from soft stretch fabric, perfect for layering or wearing solo.', tags: ['fashion', 'y2k', 'trending'] },
  '3': { id: '3', title: 'Portable LED Ring Light', price: 1299, compare_price: 2499, images: ['https://picsum.photos/seed/led1/600/600'], rating: 4.6, review_count: 412, sold_count: 1203, category: 'Electronics', description: '10-inch portable ring light with adjustable color temperature and brightness. Includes phone holder and tripod stand.', tags: ['creator', 'tech', 'lighting'] },
  '4': { id: '4', title: 'Viral Cleansing Balm', price: 2199, compare_price: null, images: ['https://picsum.photos/seed/balm/600/600'], rating: 4.8, review_count: 893, sold_count: 8920, category: 'Beauty', description: 'The cleansing balm that broke the internet. Melts away makeup and SPF without stripping skin. No residue, just glass skin.', tags: ['skincare', 'viral', 'kbeauty'] },
  '5': { id: '5', title: 'Aesthetic Desk Lamp', price: 3499, compare_price: null, images: ['https://picsum.photos/seed/lamp/600/600'], rating: 4.5, review_count: 231, sold_count: 3421, category: 'Home', description: 'Minimalist LED desk lamp with touch dimmer and USB-C charging port. 5 color temperatures, 10 brightness levels.', tags: ['aesthetic', 'desk', 'home'] },
  '6': { id: '6', title: 'Cottagecore Dress', price: 4599, compare_price: null, images: ['https://picsum.photos/seed/dress/600/600'], rating: 4.6, review_count: 156, sold_count: 1892, category: 'Fashion', description: 'Flowing midi dress in cottagecore floral print. Smocked bodice, adjustable straps, 100% viscose.', tags: ['fashion', 'cottagecore', 'summer'] },
  '7': { id: '7', title: 'Spicy Ramen Kit x3', price: 1599, compare_price: null, images: ['https://picsum.photos/seed/ramen/600/600'], rating: 4.9, review_count: 1204, sold_count: 12043, category: 'Food', description: 'Three packs of our best-selling spicy ramen. Includes signature broth sachet, dried toppings, and noodles.', tags: ['food', 'ramen', 'spicy'] },
}

export default function ProductPage() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Partial<Product> | null>(null)
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [showDescription, setShowDescription] = useState(true)
  const addItem = useCartStore((s) => s.addItem)
  const totalItems = useCartStore((s) => s.totalItems())

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error('not found')
        return r.json()
      })
      .then((data) => {
        setProduct(data.product)
        setReviews(data.reviews || [])
      })
      .catch(() => {
        setProduct(STATIC_PRODUCTS[id] ?? null)
      })
      .finally(() => setIsLoading(false))
  }, [id])

  const handleAddToCart = () => {
    if (!product?.id) return
    for (let i = 0; i < quantity; i++) {
      addItem(product as Product)
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try { await navigator.share({ title: product?.title, url }) } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(url)
    }
  }

  if (isLoading) {
    return (
      <div className="pb-24">
        <Skeleton className="w-full aspect-square" />
        <div className="p-4 space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 pb-20">
        <p className="text-white/60">Product not found</p>
        <Link href="/shop" className="text-[#FE2C55] text-sm">
          Back to Shop
        </Link>
      </div>
    )
  }

  const images = product.images?.length
    ? product.images
    : ['https://picsum.photos/seed/product/600/600']

  const discount = product.compare_price
    ? Math.round((1 - product.price! / product.compare_price) * 100)
    : null

  return (
    <div className="pb-28">
      {/* Top nav */}
      <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-sm flex items-center justify-between px-4 py-3 pt-safe">
        <Link href="/shop">
          <ArrowLeft className="w-5 h-5 text-white" />
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

      {/* Hero image */}
      <div className="relative">
        <img
          src={images[activeImage]}
          alt={product.title}
          className="w-full aspect-square object-cover"
        />
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={cn(
                  'w-1.5 h-1.5 rounded-full transition-colors',
                  i === activeImage ? 'bg-white' : 'bg-white/40'
                )}
              />
            ))}
          </div>
        )}
        {discount && (
          <span className="absolute top-3 left-3 bg-[#FE2C55] text-white text-xs font-bold px-2 py-0.5 rounded-md">
            -{discount}%
          </span>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 px-4 pt-3 overflow-x-auto hide-scrollbar">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActiveImage(i)}
              className={cn(
                'w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors',
                i === activeImage ? 'border-[#FE2C55]' : 'border-transparent'
              )}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="px-4 pt-4 space-y-4">
        {/* Title + wishlist */}
        <div>
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-white font-bold text-lg leading-tight flex-1">{product.title}</h1>
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className="flex-shrink-0 mt-0.5"
            >
              <Heart
                className={cn(
                  'w-6 h-6 transition-colors',
                  isWishlisted ? 'fill-[#FE2C55] text-[#FE2C55]' : 'text-white/50'
                )}
              />
            </button>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-[#FE2C55] font-bold text-2xl">
              {formatPrice(product.price ?? 0)}
            </span>
            {product.compare_price && (
              <span className="text-white/40 text-base line-through">
                {formatPrice(product.compare_price)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'w-3.5 h-3.5',
                    i < Math.floor(product.rating ?? 0)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-white/20'
                  )}
                />
              ))}
              <span className="text-white/60 text-xs ml-1">{product.rating?.toFixed(1)}</span>
            </div>
            <span className="text-white/30 text-xs">·</span>
            <span className="text-white/50 text-xs">
              {formatCount(product.review_count ?? 0)} reviews
            </span>
            <span className="text-white/30 text-xs">·</span>
            <span className="text-white/50 text-xs">
              {formatCount(product.sold_count ?? 0)} sold
            </span>
          </div>
        </div>

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="bg-white/10 text-white/60 text-xs px-2.5 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Quantity picker */}
        <div className="flex items-center gap-4">
          <span className="text-white/60 text-sm">Quantity</span>
          <div className="flex items-center gap-3 bg-white/10 rounded-full px-3 py-1.5">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="text-white/70 hover:text-white w-5 h-5 flex items-center justify-center text-lg leading-none"
            >
              −
            </button>
            <span className="text-white font-semibold text-sm w-4 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="text-white/70 hover:text-white w-5 h-5 flex items-center justify-center text-lg leading-none"
            >
              +
            </button>
          </div>
        </div>

        {/* Trust badges */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Shield, label: 'Buyer Protection' },
            { icon: Truck, label: 'Fast Shipping' },
            { icon: RotateCcw, label: '30-day Return' },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="bg-white/5 rounded-xl p-2.5 flex flex-col items-center gap-1.5 text-center"
            >
              <Icon className="w-4 h-4 text-[#69C9D0]" />
              <span className="text-white/60 text-[10px] leading-tight">{label}</span>
            </div>
          ))}
        </div>

        {/* Description accordion */}
        <div className="border border-white/10 rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowDescription(!showDescription)}
            className="w-full flex items-center justify-between px-4 py-3"
          >
            <span className="text-white font-semibold text-sm">Description</span>
            {showDescription ? (
              <ChevronUp className="w-4 h-4 text-white/50" />
            ) : (
              <ChevronDown className="w-4 h-4 text-white/50" />
            )}
          </button>
          {showDescription && (
            <p className="px-4 pb-4 text-white/70 text-sm leading-relaxed">
              {product.description ?? 'No description available.'}
            </p>
          )}
        </div>

        {/* Reviews */}
        {reviews.length > 0 && (
          <div>
            <h2 className="text-white font-bold text-base mb-3">Reviews</h2>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="flex gap-3">
                  <Avatar className="w-9 h-9 flex-shrink-0">
                    <AvatarImage src={review.user?.avatar_url ?? ''} />
                    <AvatarFallback>
                      {review.user?.username?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white text-xs font-semibold">
                        @{review.user?.username}
                      </span>
                      <div className="flex">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                    </div>
                    {review.content && (
                      <p className="text-white/70 text-sm mt-0.5">{review.content}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Add to Cart bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-black border-t border-white/10 px-4 py-3 pb-safe flex gap-3">
        <button
          onClick={handleShare}
          className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 hover:bg-white/15 transition-colors"
        >
          <Share2 className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={handleAddToCart}
          className="flex-1 h-12 bg-[#FE2C55] hover:bg-[#e01f45] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-4 h-4" />
          Add to Cart · {formatPrice((product.price ?? 0) * quantity)}
        </button>
      </div>
    </div>
  )
}
