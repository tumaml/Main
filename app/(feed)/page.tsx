'use client'

import { useState } from 'react'
import { VideoFeed } from '@/components/video/VideoFeed'
import { FeedHeader, type FeedTab, type FeedFilter } from '@/components/shared/FeedHeader'
import { useFeedVideos } from '@/hooks/useFeedVideos'

export default function FYPPage() {
  const [activeTab, setActiveTab] = useState<FeedTab>('fyp')
  const [activeFilter, setActiveFilter] = useState<FeedFilter>('all')
  const { videos, isLoading } = useFeedVideos(activeTab, activeFilter)

  return (
    <>
      <FeedHeader
        activeTab={activeTab}
        onTabChange={(tab) => { setActiveTab(tab) }}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {isLoading && videos.length === 0 ? (
        <FeedSkeleton />
      ) : (
        <VideoFeed key={`${activeTab}-${activeFilter}`} initialVideos={videos} tab={activeTab} filter={activeFilter} />
      )}
    </>
  )
}

function FeedSkeleton() {
  return (
    <div className="h-[100dvh] bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        <p className="text-white/40 text-sm">Loading videos...</p>
      </div>
    </div>
  )
}
