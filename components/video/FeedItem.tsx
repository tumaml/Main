'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { VolumeX, Volume2, ShoppingCart, CalendarDays, MessageCircle } from 'lucide-react'
import { Video } from '@/types/database'
import { VideoPlayer } from './VideoPlayer'
import { ActionSidebar } from './ActionSidebar'
import { Caption } from './Caption'
import { CommentSheet } from './CommentSheet'
import { usePlayerStore } from '@/store/player'
import { useCartStore } from '@/store/cart'
import { formatPrice } from '@/lib/utils'

// ─── Commerce Overlay ─────────────────────────────────────────────────────────

function CommerceOverlay({ video }: { video: Video }) {
  const addItem = useCartStore((s) => s.addItem)
  const product = video.linked_product

  const displayPrice = product?.price ?? video.price
  const displayTitle = product?.title ?? video.title ?? ''
  const isService = video.listing_type === 'service'

  const handleAction = () => {
    if (isService) return // Book Now — placeholder for phase 2 booking flow
    if (product) addItem(product)
  }

  const handleContact = () => {
    // Opens DM — placeholder until inbox is wired to video context
    window.location.href = `/inbox`
  }

  return (
    <div className="absolute left-4 right-20 z-10 pb-safe"
      style={{ bottom: video.caption ? '120px' : '80px' }}
    >
      <div className="bg-black/70 backdrop-blur-md rounded-2xl px-3 py-2.5 border border-white/10 flex items-center gap-3">
        {/* Product thumbnail */}
        {product?.images?.[0] && (
          <img
            src={product.images[0]}
            alt={displayTitle}
            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
          />
        )}

        {/* Title + price */}
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-xs truncate">{displayTitle}</p>
          {displayPrice != null && (
            <p className="text-[#FE2C55] font-bold text-sm">{formatPrice(displayPrice)}</p>
          )}
        </div>

        {/* CTA button */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <button
            onClick={handleAction}
            className="flex items-center gap-1.5 bg-[#FE2C55] hover:bg-[#e01f45] active:scale-95 text-white text-xs font-bold px-3 py-1.5 rounded-full transition-all"
          >
            {isService ? (
              <>
                <CalendarDays className="w-3 h-3" />
                Book Now
              </>
            ) : (
              <>
                <ShoppingCart className="w-3 h-3" />
                Add to Cart
              </>
            )}
          </button>
          <button
            onClick={handleContact}
            className="flex items-center gap-1 text-white/60 text-[10px] hover:text-white/90 transition-colors"
          >
            <MessageCircle className="w-3 h-3" />
            Contact Seller
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Feed Item ─────────────────────────────────────────────────────────────────

interface FeedItemProps {
  video: Video
  isActive: boolean
  onActivate: () => void
}

export function FeedItem({ video, isActive: _isActive, onActivate }: FeedItemProps) {
  const { ref, inView } = useInView({ threshold: 0.6 })
  const [showComments, setShowComments] = useState(false)
  const { isMuted, toggleMute } = usePlayerStore()
  const prevInView = useRef(false)

  useEffect(() => {
    if (inView && !prevInView.current) {
      onActivate()
    }
    prevInView.current = inView
  }, [inView, onActivate])

  return (
    <div
      ref={ref}
      className="relative w-full h-[100dvh] flex-shrink-0 snap-start snap-always overflow-hidden bg-black"
    >
      {/* Video */}
      <VideoPlayer
        videoId={video.id}
        src={video.video_url}
        poster={video.thumbnail_url ?? undefined}
        className="absolute inset-0"
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />

      {/* Mute toggle — top right */}
      <button
        onClick={toggleMute}
        className="absolute top-16 right-4 z-20 w-8 h-8 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-sm"
      >
        {isMuted ? (
          <VolumeX className="w-4 h-4 text-white" />
        ) : (
          <Volume2 className="w-4 h-4 text-white" />
        )}
      </button>

      {/* Right sidebar actions */}
      <div className="absolute right-3 bottom-24 z-10">
        <ActionSidebar
          video={video}
          onComment={() => setShowComments(true)}
        />
      </div>

      {/* Commerce overlay — shown when video has a listing */}
      {video.listing_type && (
        <CommerceOverlay video={video} />
      )}

      {/* Bottom caption strip */}
      <div className="absolute bottom-4 left-4 right-20 z-10 pb-safe">
        <Caption video={video} />
      </div>

      {/* Comment sheet */}
      <CommentSheet
        videoId={video.id}
        commentCount={video.comment_count}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
      />
    </div>
  )
}
