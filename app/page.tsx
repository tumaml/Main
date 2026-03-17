'use client'

import { useState } from 'react'
import { VideoFeed } from '@/components/feed/VideoFeed'
import { FeedHeader } from '@/components/layout/FeedHeader'
import { BottomNav } from '@/components/layout/BottomNav'
import { useFeedVideos } from '@/hooks/useFeedVideos'

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'fyp' | 'following'>('fyp')
  const { videos, isLoading } = useFeedVideos(activeTab)

  return (
    <div className="relative w-full h-[100dvh] bg-black overflow-hidden">
      {/* Fixed header */}
      <FeedHeader activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Video feed */}
      {isLoading && videos.length === 0 ? (
        <FeedSkeleton />
      ) : (
        <VideoFeed key={activeTab} initialVideos={videos} tab={activeTab} />
      )}

      {/* Bottom nav */}
      <BottomNav />
    </div>
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
