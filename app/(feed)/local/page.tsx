'use client'

import { FeedHeader } from '@/components/shared/FeedHeader'
import { useRouter } from 'next/navigation'
import { MapPin } from 'lucide-react'

export default function LocalPage() {
  const router = useRouter()

  return (
    <>
      <FeedHeader
        activeTab="local"
        onTabChange={(tab) => {
          if (tab === 'fyp') router.push('/')
          else if (tab === 'following') router.push('/following')
          else if (tab === 'friends') router.push('/friends')
        }}
      />
      <div className="h-[100dvh] flex flex-col items-center justify-center gap-4 text-white/60 px-8 text-center">
        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
          <MapPin className="w-8 h-8 text-white/40" />
        </div>
        <div>
          <p className="text-white font-semibold text-lg mb-1">Nearby</p>
          <p className="text-sm">Local content is coming soon.</p>
          <p className="text-xs text-white/40 mt-1">Phase 2</p>
        </div>
      </div>
    </>
  )
}
