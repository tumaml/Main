'use client'

import { useState, useCallback } from 'react'
import { Video } from '@/types/database'

interface UseInfiniteVideosOptions {
  tab?: 'fyp' | 'following'
  userId?: string
  initialVideos?: Video[]
}

export function useInfiniteVideos({
  tab = 'fyp',
  userId,
  initialVideos = [],
}: UseInfiniteVideosOptions = {}) {
  const [videos, setVideos] = useState<Video[]>(initialVideos)
  const [cursor, setCursor] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    try {
      const params = new URLSearchParams({ tab, limit: '10' })
      if (cursor) params.set('cursor', cursor)
      if (userId) params.set('userId', userId)

      const res = await fetch(`/api/videos?${params}`)
      const data = await res.json()

      if (data.videos?.length > 0) {
        setVideos((prev) => {
          const existingIds = new Set(prev.map((v) => v.id))
          const newVideos = data.videos.filter((v: Video) => !existingIds.has(v.id))
          return [...prev, ...newVideos]
        })
        setCursor(data.nextCursor)
        setHasMore(!!data.nextCursor)
      } else {
        setHasMore(false)
      }
    } catch (err) {
      console.error('Failed to load videos:', err)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, hasMore, cursor, tab, userId])

  const reset = useCallback(() => {
    setVideos([])
    setCursor(null)
    setHasMore(true)
  }, [])

  return { videos, isLoading, hasMore, loadMore, reset, setVideos }
}
