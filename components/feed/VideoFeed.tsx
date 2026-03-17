'use client'

import { useCallback, useEffect, useRef } from 'react'
import { VideoCard } from '@/components/video/VideoCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Video } from '@/types/database'
import { usePlayerStore } from '@/store/player'
import { useInfiniteVideos } from '@/hooks/useInfiniteVideos'

interface VideoFeedProps {
  initialVideos: Video[]
  tab: 'fyp' | 'following'
}

export function VideoFeed({ initialVideos, tab }: VideoFeedProps) {
  const { videos, isLoading, hasMore, loadMore, setVideos } = useInfiniteVideos({
    tab,
    initialVideos,
  })
  const { setCurrentVideoId, setCurrentIndex, currentVideoId } = usePlayerStore()
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null)

  // Start playing first video
  useEffect(() => {
    if (videos.length > 0 && !currentVideoId) {
      setCurrentVideoId(videos[0].id)
    }
  }, [videos, currentVideoId, setCurrentVideoId])

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )
    const el = loadMoreTriggerRef.current
    if (el) observer.observe(el)
    return () => { if (el) observer.unobserve(el) }
  }, [hasMore, isLoading, loadMore])

  const handleActivate = useCallback(
    (videoId: string, index: number) => {
      setCurrentVideoId(videoId)
      setCurrentIndex(index)
    },
    [setCurrentVideoId, setCurrentIndex]
  )

  if (videos.length === 0 && !isLoading) {
    return (
      <div className="h-[100dvh] flex flex-col items-center justify-center gap-4 text-white/60">
        <p className="text-lg font-semibold">No videos yet</p>
        <p className="text-sm">
          {tab === 'following' ? 'Follow creators to see their videos here' : 'Check back soon!'}
        </p>
      </div>
    )
  }

  return (
    <div className="h-[100dvh] overflow-y-scroll snap-y snap-mandatory scroll-smooth hide-scrollbar">
      {videos.map((video, index) => (
        <VideoCard
          key={video.id}
          video={video}
          isActive={video.id === currentVideoId}
          onActivate={() => handleActivate(video.id, index)}
        />
      ))}

      {/* Load more trigger */}
      <div ref={loadMoreTriggerRef} className="h-4" />

      {/* Loading skeleton */}
      {isLoading && (
        <div className="h-[100dvh] flex-shrink-0 snap-start bg-black flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}
