'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Heart, Play } from 'lucide-react'
import { Skeleton } from '@/components/shared/skeleton'
import { Video } from '@/types/database'
import { formatCount } from '@/lib/utils'

interface VideoGridProps {
  userId: string
  tab: 'videos' | 'liked' | 'saved'
}

export function VideoGrid({ userId, tab }: VideoGridProps) {
  const [videos, setVideos] = useState<Video[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    const params = new URLSearchParams()

    if (tab === 'videos') {
      params.set('userId', userId)
    } else if (tab === 'liked') {
      params.set('userId', userId)
      params.set('tab', 'liked')
    } else {
      params.set('userId', userId)
      params.set('tab', 'saved')
    }

    fetch(`/api/videos?${params}`)
      .then((r) => r.json())
      .then((data) => setVideos(data.videos || []))
      .catch(() => setVideos([]))
      .finally(() => setIsLoading(false))
  }, [userId, tab])

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-0.5">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[9/16]" />
        ))}
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Play className="w-12 h-12 text-white/20" />
        <p className="text-white/40 text-sm">No videos yet</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-0.5">
      {videos.map((video) => (
        <Link key={video.id} href={`/video/${video.id}`}>
          <div className="aspect-[9/16] bg-white/5 relative overflow-hidden">
            {video.thumbnail_url ? (
              <img
                src={video.thumbnail_url}
                alt={video.caption}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-white/10" />
            )}
            <div className="absolute bottom-1 left-1 flex items-center gap-0.5">
              <Heart className="w-3 h-3 text-white fill-white" />
              <span className="text-white text-xs font-semibold drop-shadow">
                {formatCount(video.like_count)}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
