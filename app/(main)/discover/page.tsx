'use client'

import { useState } from 'react'
import { Search, X, TrendingUp, Hash, Music } from 'lucide-react'
import Link from 'next/link'
import { BottomNav } from '@/components/layout/BottomNav'
import { cn } from '@/lib/utils'
import { formatCount } from '@/lib/utils'

const TRENDING_HASHTAGS = [
  { name: 'fyp', count: 9800000 },
  { name: 'viral', count: 7200000 },
  { name: 'dance', count: 8900000 },
  { name: 'food', count: 5600000 },
  { name: 'fashion', count: 4100000 },
  { name: 'travel', count: 3400000 },
  { name: 'tech', count: 2800000 },
  { name: 'comedy', count: 6300000 },
  { name: 'beauty', count: 3900000 },
  { name: 'fitness', count: 2100000 },
]

const CATEGORIES = [
  { name: 'For You', emoji: '✨', color: 'from-purple-500 to-pink-500' },
  { name: 'Trending', emoji: '🔥', color: 'from-orange-500 to-red-500' },
  { name: 'Fashion', emoji: '👗', color: 'from-pink-400 to-rose-500' },
  { name: 'Food', emoji: '🍜', color: 'from-yellow-400 to-orange-500' },
  { name: 'Tech', emoji: '💻', color: 'from-blue-500 to-cyan-500' },
  { name: 'Travel', emoji: '✈️', color: 'from-green-400 to-teal-500' },
  { name: 'Comedy', emoji: '😂', color: 'from-yellow-300 to-yellow-500' },
  { name: 'Dance', emoji: '💃', color: 'from-violet-500 to-purple-500' },
  { name: 'Beauty', emoji: '💄', color: 'from-pink-300 to-pink-500' },
  { name: 'Fitness', emoji: '💪', color: 'from-red-400 to-orange-400' },
  { name: 'Gaming', emoji: '🎮', color: 'from-indigo-500 to-blue-500' },
  { name: 'Music', emoji: '🎵', color: 'from-cyan-400 to-blue-400' },
]

export default function DiscoverPage() {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className="min-h-[100dvh] bg-black pb-20">
      {/* Search bar */}
      <div className="sticky top-0 z-30 bg-black px-4 pt-safe pb-2">
        <div className="flex items-center gap-3 pt-3">
          <div className="flex-1 flex items-center gap-2 bg-white/10 rounded-full px-4 py-2.5">
            <Search className="w-4 h-4 text-white/50 flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Search videos, users, sounds..."
              className="flex-1 bg-transparent text-white text-sm placeholder:text-white/40 outline-none"
            />
            {query && (
              <button onClick={() => setQuery('')}>
                <X className="w-4 h-4 text-white/50" />
              </button>
            )}
          </div>
          {isFocused && (
            <button
              onMouseDown={() => { setQuery(''); setIsFocused(false) }}
              className="text-white/70 text-sm whitespace-nowrap"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {query ? (
        <SearchResults query={query} />
      ) : (
        <div className="px-4 space-y-8 pt-4">
          {/* Categories grid */}
          <section>
            <h2 className="text-white font-bold text-base mb-3">Explore</h2>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(({ name, emoji, color }) => (
                <button
                  key={name}
                  className={`relative h-20 rounded-2xl bg-gradient-to-br ${color} flex items-end p-3 overflow-hidden active:scale-95 transition-transform`}
                >
                  <span className="absolute top-2 right-3 text-2xl">{emoji}</span>
                  <span className="text-white font-bold text-sm drop-shadow-md">{name}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Trending hashtags */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-[#FE2C55]" />
              <h2 className="text-white font-bold text-base">Trending</h2>
            </div>
            <div className="space-y-1">
              {TRENDING_HASHTAGS.map(({ name, count }, i) => (
                <Link
                  key={name}
                  href={`/discover/hashtag/${name}`}
                  className="flex items-center gap-3 py-2.5 hover:bg-white/5 rounded-xl px-2 transition-colors"
                >
                  <span className="text-white/30 text-sm font-mono w-5 text-center">{i + 1}</span>
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Hash className="w-5 h-5 text-white/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm">#{name}</p>
                    <p className="text-white/40 text-xs">{formatCount(count)} videos</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      )}

      <BottomNav />
    </div>
  )
}

function SearchResults({ query }: { query: string }) {
  // Would fetch real results from /api/search
  return (
    <div className="px-4 pt-2">
      <div className="flex gap-4 border-b border-white/10 mb-4">
        {['Top', 'Users', 'Videos', 'Sounds', 'Hashtags'].map((tab) => (
          <button
            key={tab}
            className={cn(
              'pb-3 text-sm font-medium border-b-2 transition-colors',
              tab === 'Top' ? 'border-white text-white' : 'border-transparent text-white/50'
            )}
          >
            {tab}
          </button>
        ))}
      </div>
      <p className="text-white/40 text-sm text-center mt-12">
        Search results for &quot;{query}&quot;
      </p>
    </div>
  )
}
