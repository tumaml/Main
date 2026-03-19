'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, X, TrendingUp, Hash, Heart, Users } from 'lucide-react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/shared/avatar'
import { Skeleton } from '@/components/shared/skeleton'
import { cn, formatCount } from '@/lib/utils'

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
    <div className="pb-20">
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
              onMouseDown={() => {
                setQuery('')
                setIsFocused(false)
              }}
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
    </div>
  )
}

interface SearchVideo {
  id: string
  caption: string
  thumbnail_url: string | null
  like_count: number
  view_count: number
  user?: { id: string; username: string; display_name: string; avatar_url: string | null }
}

interface SearchUser {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
  is_verified: boolean
  follower_count: number
  video_count: number
}

type SearchTab = 'Top' | 'Users' | 'Videos'

function SearchResults({ query }: { query: string }) {
  const [activeTab, setActiveTab] = useState<SearchTab>('Top')
  const [videos, setVideos] = useState<SearchVideo[]>([])
  const [users, setUsers] = useState<SearchUser[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchResults = useCallback(async (q: string, tab: SearchTab) => {
    setIsLoading(true)
    const type = tab === 'Videos' ? 'videos' : tab === 'Users' ? 'users' : 'all'
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&type=${type}`)
      const data = await res.json()
      setVideos(data.videos || [])
      setUsers(data.users || [])
    } catch {
      // silent
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (query.trim()) fetchResults(query, activeTab)
  }, [query, activeTab, fetchResults])

  const TABS: SearchTab[] = ['Top', 'Users', 'Videos']

  return (
    <div className="px-4 pt-2">
      <div className="flex gap-4 border-b border-white/10 mb-4 overflow-x-auto hide-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex-shrink-0',
              activeTab === tab ? 'border-white text-white' : 'border-transparent text-white/50'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4 mt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3 items-center">
              <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Users section */}
          {(activeTab === 'Top' || activeTab === 'Users') && users.length > 0 && (
            <section className="mb-6">
              {activeTab === 'Top' && (
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-white/50" />
                  <span className="text-white/50 text-xs font-semibold uppercase tracking-wide">Accounts</span>
                </div>
              )}
              <div className="space-y-3">
                {users.map((user) => (
                  <Link
                    key={user.id}
                    href={`/profile/${user.username}`}
                    className="flex items-center gap-3 hover:bg-white/5 rounded-xl p-2 -mx-2 transition-colors"
                  >
                    <Avatar className="w-12 h-12 flex-shrink-0">
                      <AvatarImage src={user.avatar_url ?? ''} />
                      <AvatarFallback>{user.display_name?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{user.display_name}</p>
                      <p className="text-white/50 text-xs">@{user.username}</p>
                      <p className="text-white/40 text-xs">{formatCount(user.follower_count)} followers · {formatCount(user.video_count)} videos</p>
                    </div>
                    {user.is_verified && (
                      <span className="text-[#20D5EC] text-xs">✓</span>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Videos section */}
          {(activeTab === 'Top' || activeTab === 'Videos') && videos.length > 0 && (
            <section>
              {activeTab === 'Top' && (
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="w-4 h-4 text-white/50" />
                  <span className="text-white/50 text-xs font-semibold uppercase tracking-wide">Videos</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                {videos.map((video) => (
                  <Link key={video.id} href={`/video/${video.id}`}>
                    <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-white/5">
                      {video.thumbnail_url ? (
                        <img
                          src={video.thumbnail_url}
                          alt={video.caption}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-white/10" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-white text-xs line-clamp-2 leading-tight">{video.caption}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Heart className="w-3 h-3 text-white fill-white" />
                          <span className="text-white/70 text-[10px]">{formatCount(video.like_count)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {videos.length === 0 && users.length === 0 && (
            <p className="text-white/40 text-sm text-center mt-12">
              No results for &ldquo;{query}&rdquo;
            </p>
          )}
        </>
      )}
    </div>
  )
}
