'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Music2, ChevronDown, ChevronUp } from 'lucide-react'
import { Video } from '@/types/database'
import { cn } from '@/lib/utils'

interface CaptionProps {
  video: Video
}

export function Caption({ video }: CaptionProps) {
  const [expanded, setExpanded] = useState(false)

  const caption = video.caption || ''
  const isLong = caption.length > 100

  const parsedCaption = caption.split(/(\s+)/).map((word, i) => {
    if (word.startsWith('#')) {
      return (
        <Link
          key={i}
          href={`/discover/hashtag/${word.slice(1)}`}
          className="text-white font-semibold hover:underline"
        >
          {word}
        </Link>
      )
    }
    if (word.startsWith('@')) {
      return (
        <Link
          key={i}
          href={`/${word.slice(1)}`}
          className="text-white font-semibold hover:underline"
        >
          {word}
        </Link>
      )
    }
    return word
  })

  return (
    <div className="flex flex-col gap-2">
      {/* Username + verified seller badge */}
      <Link href={`/${video.user?.username}`} className="flex items-center gap-2 flex-wrap">
        <span className="text-white font-bold text-sm hover:underline drop-shadow-md">
          @{video.user?.username}
        </span>
        {video.user?.is_verified && !video.user?.is_seller && (
          <span className="w-4 h-4 bg-[#FE2C55] rounded-full flex items-center justify-center text-white text-[10px] font-bold">
            ✓
          </span>
        )}
        {video.user?.is_verified && video.user?.is_seller && (
          <span className="flex items-center gap-1 bg-[#20D5EC]/20 border border-[#20D5EC]/40 text-[#20D5EC] text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
            ✓ Verified Seller
          </span>
        )}
      </Link>

      {/* Caption text */}
      <div className="text-white text-sm leading-relaxed drop-shadow-md">
        <span className={cn(!expanded && isLong && 'line-clamp-2')}>{parsedCaption}</span>
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-white/70 text-xs ml-1 hover:text-white"
          >
            {expanded ? (
              <span className="flex items-center gap-0.5">
                less <ChevronUp className="w-3 h-3" />
              </span>
            ) : (
              <span className="flex items-center gap-0.5">
                more <ChevronDown className="w-3 h-3" />
              </span>
            )}
          </button>
        )}
      </div>

      {/* Sound */}
      <div className="flex items-center gap-1.5 text-white text-xs drop-shadow-md">
        <Music2 className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="truncate max-w-[200px]">
          {video.user?.username
            ? `original sound - ${video.user.username}`
            : 'original sound'}
        </span>
      </div>
    </div>
  )
}
