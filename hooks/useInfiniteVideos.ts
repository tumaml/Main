'use client'

import { useState, useCallback } from 'react'
import { Video } from '@/types/database'
import type { FeedTab, FeedFilter } from '@/components/shared/FeedHeader'

interface UseInfiniteVideosOptions {
  tab?: FeedTab
  filter?: FeedFilter
  userId?: string
  initialVideos?: Video[]
}

export function useInfiniteVideos({
  tab = 'fyp',
  filter = 'all',
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
      if (filter === 'product') params.set('type', 'product')
      if (filter === 'service') params.set('type', 'service')
      if (filter === 'under10') params.set('max_price', '1000')
      if (filter === 'used') params.set('condition', 'used')
      if (filter === 'new') params.set('condition', 'new')

      const res = await fetch(`/api/videos?${params}`)
      const data = await res.json() as { videos?: Video[]; nextCursor?: string | null }

      if (data.videos && data.videos.length > 0) {
        setVideos((prev) => {
          const existingIds = new Set(prev.map((v) => v.id))
          const newVideos = data.videos!.filter((v) => !existingIds.has(v.id))
          return [...prev, ...newVideos]
        })
        setCursor(data.nextCursor ?? null)
        setHasMore(!!data.nextCursor)
      } else {
        setHasMore(false)
      }
    } catch (err) {
      console.error('Failed to load videos:', err)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, hasMore, cursor, tab, filter, userId])

  const reset = useCallback(() => {
    setVideos([])
    setCursor(null)
    setHasMore(true)
  }, [])

  return { videos, isLoading, hasMore, loadMore, reset, setVideos }
}
