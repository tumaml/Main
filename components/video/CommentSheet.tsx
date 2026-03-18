'use client'

import { useState, useEffect } from 'react'
import { X, Send, Heart } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/shared/avatar'
import { Skeleton } from '@/components/shared/skeleton'
import { Comment } from '@/types/database'
import { formatCount, timeAgo } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface CommentSheetProps {
  videoId: string
  commentCount: number
  isOpen: boolean
  onClose: () => void
}

export function CommentSheet({ videoId, commentCount, isOpen, onClose }: CommentSheetProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setIsLoading(true)
    fetch(`/api/comments?videoId=${videoId}`)
      .then((r) => r.json())
      .then((data) => setComments(data.comments || []))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [isOpen, videoId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, content: newComment }),
      })
      const data = await res.json()
      if (data.comment) {
        setComments((prev) => [data.comment, ...prev])
        setNewComment('')
      }
    } catch {
      // Silent — comment failed
    }
    setIsSubmitting(false)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'absolute inset-0 bg-black/50 z-20 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 z-30 bg-[#1a1a1a] rounded-t-2xl transition-transform duration-300',
          isOpen ? 'translate-y-0' : 'translate-y-full'
        )}
        style={{ height: '70dvh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h3 className="text-white font-semibold text-base">
            {formatCount(commentCount)} comments
          </h3>
          <button onClick={onClose} className="text-white/70 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comments list */}
        <div
          className="flex-1 overflow-y-auto px-4 py-3 space-y-4"
          style={{ height: 'calc(70dvh - 120px)' }}
        >
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              ))
            : comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
          {!isLoading && comments.length === 0 && (
            <p className="text-center text-white/40 text-sm mt-8">Be the first to comment!</p>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-white/10 flex gap-3">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 bg-white/10 rounded-full px-4 py-2 text-white text-sm placeholder:text-white/40 outline-none focus:bg-white/15 transition-colors"
          />
          <button
            type="submit"
            disabled={!newComment.trim() || isSubmitting}
            className="w-10 h-10 bg-[#FE2C55] rounded-full flex items-center justify-center disabled:opacity-40 flex-shrink-0"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </form>
      </div>
    </>
  )
}

function CommentItem({ comment }: { comment: Comment }) {
  const [liked, setLiked] = useState(false)
  return (
    <div className="flex gap-3">
      <Avatar className="w-9 h-9 flex-shrink-0">
        <AvatarImage src={comment.user?.avatar_url ?? ''} />
        <AvatarFallback>{comment.user?.username?.[0]?.toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-white font-semibold text-xs mr-1">
              @{comment.user?.username}
            </span>
            <p className="text-white/90 text-sm leading-relaxed">{comment.content}</p>
            <div className="flex gap-3 mt-1">
              <span className="text-white/40 text-xs">{timeAgo(comment.created_at)}</span>
              <button className="text-white/40 text-xs hover:text-white/70">Reply</button>
            </div>
          </div>
          <button
            onClick={() => setLiked(!liked)}
            className="flex flex-col items-center gap-0.5 flex-shrink-0 pt-0.5"
          >
            <Heart
              className={cn(
                'w-4 h-4 transition-colors',
                liked ? 'fill-[#FE2C55] text-[#FE2C55]' : 'text-white/50'
              )}
            />
            <span className="text-white/40 text-[10px]">
              {formatCount(comment.like_count + (liked ? 1 : 0))}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
