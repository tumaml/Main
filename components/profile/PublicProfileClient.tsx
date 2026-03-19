'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Share2, Grid3x3, Heart, Bookmark } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/shared/avatar'
import { Badge } from '@/components/shared/badge'
import { VideoGrid } from '@/components/profile/VideoGrid'
import { formatCount } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useFollow } from '@/hooks/useVideo'
import { User } from '@/types/database'

type ProfileTab = 'videos' | 'liked' | 'saved'

interface PublicProfileClientProps {
  user: User
}

export function PublicProfileClient({ user }: PublicProfileClientProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>('videos')
  const { isSignedIn, profile: me } = useAuth()
  const isOwnProfile = me?.id === user.id
  const { isFollowing, toggleFollow } = useFollow(isOwnProfile ? undefined : user.id)

  const handleShare = async () => {
    const url = `${window.location.origin}/@${user.username}`
    if (navigator.share) {
      try { await navigator.share({ title: user.display_name, url }) } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(url)
    }
  }

  const tabs: { id: ProfileTab; icon: typeof Grid3x3 }[] = [
    { id: 'videos', icon: Grid3x3 },
    { id: 'liked', icon: Heart },
    { id: 'saved', icon: Bookmark },
  ]

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/" className="w-10 text-white/70 hover:text-white">
          ←
        </Link>
        <h1 className="text-white font-bold text-base truncate max-w-[200px]">
          @{user.username}
        </h1>
        <button onClick={handleShare}>
          <Share2 className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Profile info */}
      <div className="flex flex-col items-center gap-3 px-4 pb-6">
        <Avatar className="w-24 h-24 border-2 border-white/20">
          <AvatarImage src={user.avatar_url ?? ''} />
          <AvatarFallback className="text-2xl bg-white/10">
            {user.display_name?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="text-center">
          <div className="flex items-center gap-2 justify-center">
            <h2 className="text-white font-bold text-xl">{user.display_name}</h2>
            {user.is_verified && <Badge variant="verified">✓</Badge>}
          </div>
          <p className="text-white/60 text-sm mt-0.5">@{user.username}</p>
        </div>

        <div className="flex gap-8">
          {[
            { label: 'Following', value: user.following_count },
            { label: 'Followers', value: user.follower_count },
            { label: 'Likes', value: user.like_count },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-white font-bold text-lg">{formatCount(value)}</p>
              <p className="text-white/50 text-xs">{label}</p>
            </div>
          ))}
        </div>

        {isOwnProfile ? (
          <Link
            href="/settings"
            className="w-full max-w-xs h-9 border border-white/20 text-white text-sm font-semibold rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            Edit profile
          </Link>
        ) : (
          <div className="flex gap-2 w-full max-w-xs">
            {isSignedIn ? (
              <button
                onClick={toggleFollow}
                className={cn(
                  'flex-1 h-9 text-sm font-bold rounded-lg transition-colors',
                  isFollowing
                    ? 'border border-white/20 text-white hover:bg-white/10'
                    : 'bg-[#FE2C55] text-white hover:bg-[#e01f45]'
                )}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            ) : (
              <Link
                href="/sign-in"
                className="flex-1 h-9 bg-[#FE2C55] text-white text-sm font-bold rounded-lg flex items-center justify-center hover:bg-[#e01f45] transition-colors"
              >
                Follow
              </Link>
            )}
            <button className="w-9 h-9 border border-white/20 text-white rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors">
              ···
            </button>
          </div>
        )}

        {user.bio && (
          <p className="text-white/80 text-sm text-center max-w-xs leading-relaxed">{user.bio}</p>
        )}
        {user.website_url && (
          <a
            href={user.website_url}
            className="text-[#69C9D0] text-sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            {user.website_url.replace(/^https?:\/\//, '')}
          </a>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {tabs.map(({ id, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              'flex-1 flex items-center justify-center py-3 transition-colors border-b-2',
              activeTab === id ? 'border-white text-white' : 'border-transparent text-white/40'
            )}
          >
            <Icon className="w-5 h-5" />
          </button>
        ))}
      </div>

      <VideoGrid userId={user.id} tab={activeTab} />
    </div>
  )
}
