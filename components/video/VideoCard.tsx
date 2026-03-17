'use client'

import { useEffect, useRef } from 'react'
import { useInView } from 'react-intersection-observer'
import { Video } from '@/types/database'
import { VideoPlayer } from './VideoPlayer'
import { VideoActions } from './VideoActions'
import { VideoInfo } from './VideoInfo'
import { CommentSheet } from './CommentSheet'
import { VolumeX, Volume2 } from 'lucide-react'
import { usePlayerStore } from '@/store/player'
import { useState } from 'react'

interface VideoCardProps {
  video: Video
  isActive: boolean
  onActivate: () => void
}

export function VideoCard({ video, isActive, onActivate }: VideoCardProps) {
  const { ref, inView } = useInView({ threshold: 0.6 })
  const [showComments, setShowComments] = useState(false)
  const { isMuted, toggleMute, currentVideoId } = usePlayerStore()
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
        poster={video.thumbnail_url || undefined}
        className="absolute inset-0"
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />

      {/* Mute button — top right */}
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
        <VideoActions
          video={video}
          onComment={() => setShowComments(true)}
        />
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-4 left-4 right-20 z-10 pb-safe">
        <VideoInfo video={video} />
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
