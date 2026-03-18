'use client'

import Link from 'next/link'
import { Search, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export type FeedTab = 'fyp' | 'following' | 'friends' | 'local'

interface FeedHeaderProps {
  activeTab: FeedTab
  onTabChange: (tab: FeedTab) => void
}

const TABS: { id: FeedTab; label: string }[] = [
  { id: 'following', label: 'Following' },
  { id: 'fyp', label: 'For You' },
  { id: 'friends', label: 'Friends' },
  { id: 'local', label: 'Nearby' },
]

export function FeedHeader({ activeTab, onTabChange }: FeedHeaderProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 pt-safe pointer-events-none">
      {/* Left: inbox icon */}
      <Link href="/inbox" className="pointer-events-auto w-8 flex items-center justify-center">
        <MessageCircle className="w-5 h-5 text-white drop-shadow-md" />
      </Link>

      {/* Center: tabs */}
      <div className="pointer-events-auto flex items-center justify-center gap-5 h-12 overflow-x-auto hide-scrollbar">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={cn(
              'text-sm font-semibold transition-all pb-1 border-b-2 whitespace-nowrap drop-shadow-md',
              activeTab === id
                ? 'text-white border-white'
                : 'text-white/60 border-transparent hover:text-white/80'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Right: search */}
      <Link href="/discover" className="pointer-events-auto w-8 flex items-center justify-center">
        <Search className="w-5 h-5 text-white drop-shadow-md" />
      </Link>
    </div>
  )
}
