'use client'

import { useState } from 'react'
import { Heart, MessageCircle, Share2, Bookmark, Music } from 'lucide-react'
import { cn, formatCount } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Video } from '@/types/database'
import { useVideoInteractions } from '@/hooks/useVideo'
import { useAuth } from '@/hooks/useAuth'

interface VideoActionsProps {
  video: Video
  onComment?: () => void
  onShare?: () => void
}

export function VideoActions({ video, onComment, onShare }: VideoActionsProps) {
  const { isSignedIn } = useAuth()
  const { isLiked, likeCount, isBookmarked, toggleLike, toggleBookmark } = useVideoInteractions(
    video.id,
    video.is_liked,
    video.like_count
  )

  const handleLike = () => {
    if (!isSignedIn) return // TODO: show sign-in modal
    toggleLike()
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.caption,
          url: `${window.location.origin}/video/${video.id}`,
        })
      } catch {}
    } else {
      await navigator.clipboard.writeText(`${window.location.origin}/video/${video.id}`)
    }
    onShare?.()
  }

  return (
    <div className="flex flex-col items-center gap-5 pb-8">
      {/* Creator avatar with follow button */}
      <div className="relative">
        <Avatar className="w-12 h-12 border-2 border-white">
          <AvatarImage src={video.user?.avatar_url || ''} alt={video.user?.username} />
          <AvatarFallback>{video.user?.username?.[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <button className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 bg-[#FE2C55] rounded-full flex items-center justify-center text-white text-xs font-bold hover:bg-[#e01f45] transition-colors">
          +
        </button>
      </div>

      {/* Like */}
      <ActionButton
        icon={
          <Heart
            className={cn(
              'w-7 h-7 transition-all duration-200',
              isLiked ? 'fill-[#FE2C55] text-[#FE2C55] scale-110' : 'text-white'
            )}
          />
        }
        label={formatCount(likeCount)}
        onClick={handleLike}
        active={isLiked}
      />

      {/* Comment */}
      <ActionButton
        icon={<MessageCircle className="w-7 h-7 text-white" />}
        label={formatCount(video.comment_count)}
        onClick={onComment}
      />

      {/* Bookmark */}
      <ActionButton
        icon={
          <Bookmark
            className={cn(
              'w-7 h-7 transition-colors',
              isBookmarked ? 'fill-white text-white' : 'text-white'
            )}
          />
        }
        label={formatCount(video.bookmark_count ?? 0)}
        onClick={() => {
          if (!isSignedIn) return
          toggleBookmark()
        }}
        active={isBookmarked}
      />

      {/* Share */}
      <ActionButton
        icon={<Share2 className="w-7 h-7 text-white" />}
        label={formatCount(video.share_count)}
        onClick={handleShare}
      />

      {/* Sound disc */}
      <div className="flex flex-col items-center gap-1">
        <div className="w-12 h-12 rounded-full border-4 border-white/30 bg-black/40 flex items-center justify-center animate-spin-slow overflow-hidden">
          <Avatar className="w-8 h-8">
            <AvatarImage src={video.user?.avatar_url || ''} />
            <AvatarFallback>
              <Music className="w-4 h-4 text-white" />
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  )
}

function ActionButton({
  icon,
  label,
  onClick,
  active,
}: {
  icon: React.ReactNode
  label: string
  onClick?: () => void
  active?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 group active:scale-90 transition-transform"
    >
      <div
        className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors',
          active ? 'bg-white/10' : 'bg-black/20 group-hover:bg-white/10'
        )}
      >
        {icon}
      </div>
      <span className="text-white text-xs font-semibold drop-shadow-md">{label}</span>
    </button>
  )
}
