'use client'

import { VideoFeed } from '@/components/video/VideoFeed'
import { FeedHeader } from '@/components/shared/FeedHeader'
import { useFeedVideos } from '@/hooks/useFeedVideos'
import { useRouter } from 'next/navigation'

export default function FollowingPage() {
  const { videos, isLoading } = useFeedVideos('following')
  const router = useRouter()

  return (
    <>
      <FeedHeader
        activeTab="following"
        onTabChange={(tab) => {
          if (tab === 'fyp') router.push('/')
          else if (tab === 'friends') router.push('/friends')
          else if (tab === 'local') router.push('/local')
        }}
      />
      {isLoading && videos.length === 0 ? (
        <div className="h-[100dvh] bg-black flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      ) : (
        <VideoFeed initialVideos={videos} tab="following" />
      )}
    </>
  )
}
