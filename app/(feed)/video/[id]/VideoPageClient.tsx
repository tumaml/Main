'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { VideoPlayer } from '@/components/video/VideoPlayer'
import { ActionSidebar } from '@/components/video/ActionSidebar'
import { Caption } from '@/components/video/Caption'
import { CommentSheet } from '@/components/video/CommentSheet'
import { Video } from '@/types/database'

export function VideoPageClient({ video }: { video: Video }) {
  const [commentOpen, setCommentOpen] = useState(false)

  return (
    <div className="relative w-full h-[100dvh] bg-black overflow-hidden">
      <Link
        href="/"
        className="absolute top-4 left-4 z-50 w-8 h-8 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-sm"
      >
        <ArrowLeft className="w-4 h-4 text-white" />
      </Link>

      <VideoPlayer
        videoId={video.id}
        src={video.video_url}
        poster={video.thumbnail_url ?? undefined}
        className="absolute inset-0"
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />

      <div className="absolute right-3 bottom-24 z-10">
        <ActionSidebar video={video} onComment={() => setCommentOpen(true)} />
      </div>

      <div className="absolute bottom-4 left-4 right-20 z-10 pb-safe">
        <Caption video={video} />
      </div>

      <CommentSheet
        videoId={video.id}
        commentCount={video.comment_count}
        isOpen={commentOpen}
        onClose={() => setCommentOpen(false)}
      />
    </div>
  )
}
