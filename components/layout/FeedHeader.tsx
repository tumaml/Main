'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FeedHeaderProps {
  activeTab: 'following' | 'fyp'
  onTabChange: (tab: 'following' | 'fyp') => void
}

export function FeedHeader({ activeTab, onTabChange }: FeedHeaderProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 pt-safe">
      {/* Tabs */}
      <div className="flex-1 flex items-center justify-center gap-6 h-12">
        <button
          onClick={() => onTabChange('following')}
          className={cn(
            'text-sm font-semibold transition-all pb-1 border-b-2',
            activeTab === 'following'
              ? 'text-white border-white'
              : 'text-white/60 border-transparent hover:text-white/80'
          )}
        >
          Following
        </button>
        <button
          onClick={() => onTabChange('fyp')}
          className={cn(
            'text-sm font-semibold transition-all pb-1 border-b-2',
            activeTab === 'fyp'
              ? 'text-white border-white'
              : 'text-white/60 border-transparent hover:text-white/80'
          )}
        >
          For You
        </button>
      </div>

      {/* Search */}
      <Link href="/discover" className="absolute right-4 top-1/2 -translate-y-1/2">
        <Search className="w-5 h-5 text-white" />
      </Link>
    </div>
  )
}
