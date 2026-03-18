'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Settings, Share2, Grid3x3, Heart, Bookmark, UserPlus } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/shared/avatar'
import { Button } from '@/components/shared/button'
import { Badge } from '@/components/shared/badge'
import { Skeleton } from '@/components/shared/skeleton'
import { formatCount } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { SignInButton, SignUpButton } from '@clerk/nextjs'

type ProfileTab = 'videos' | 'liked' | 'saved'

export default function ProfilePage() {
  const { profile, isLoading, isSignedIn } = useAuth()
  const [activeTab, setActiveTab] = useState<ProfileTab>('videos')

  if (!isSignedIn) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-6 px-8 pb-20">
        <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
          <UserPlus className="w-10 h-10 text-white/40" />
        </div>
        <div className="text-center">
          <h2 className="text-white text-2xl font-bold mb-2">Create your account</h2>
          <p className="text-white/50 text-sm">Sign up to follow creators, like videos, and shop</p>
        </div>
        <div className="w-full max-w-xs space-y-3">
          <SignUpButton mode="modal">
            <button className="w-full h-12 bg-[#FE2C55] hover:bg-[#e01f45] text-white font-bold rounded-xl transition-colors">
              Sign Up
            </button>
          </SignUpButton>
          <SignInButton mode="modal">
            <button className="w-full h-12 border border-white/20 text-white font-bold rounded-xl hover:bg-white/10 transition-colors">
              Log In
            </button>
          </SignInButton>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] pb-20 flex flex-col items-center pt-10 gap-4">
        <Skeleton className="w-24 h-24 rounded-full" />
        <Skeleton className="w-32 h-5" />
        <Skeleton className="w-24 h-4" />
        <div className="flex gap-8">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="w-12 h-10" />)}
        </div>
      </div>
    )
  }

  const tabs: { id: ProfileTab; icon: typeof Grid3x3 }[] = [
    { id: 'videos', icon: Grid3x3 },
    { id: 'liked', icon: Heart },
    { id: 'saved', icon: Bookmark },
  ]

  return (
    <div className="pb-20">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="w-10" />
        <h1 className="text-white font-bold text-base truncate max-w-[200px]">
          @{profile?.username}
        </h1>
        <div className="flex gap-3">
          <button>
            <Share2 className="w-5 h-5 text-white" />
          </button>
          <Link href="/settings">
            <Settings className="w-5 h-5 text-white" />
          </Link>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 px-4 pb-6">
        <Avatar className="w-24 h-24 border-2 border-white/20">
          <AvatarImage src={profile?.avatar_url ?? ''} />
          <AvatarFallback className="text-2xl bg-white/10">
            {profile?.display_name?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="text-center">
          <div className="flex items-center gap-2 justify-center">
            <h2 className="text-white font-bold text-xl">{profile?.display_name}</h2>
            {profile?.is_verified && <Badge variant="verified">✓</Badge>}
          </div>
          <p className="text-white/60 text-sm mt-0.5">@{profile?.username}</p>
        </div>

        <div className="flex gap-8">
          {[
            { label: 'Following', value: profile?.following_count ?? 0 },
            { label: 'Followers', value: profile?.follower_count ?? 0 },
            { label: 'Likes', value: profile?.like_count ?? 0 },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-white font-bold text-lg">{formatCount(value)}</p>
              <p className="text-white/50 text-xs">{label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 w-full max-w-xs">
          <Button variant="secondary" className="flex-1" size="sm">
            Edit profile
          </Button>
          <Button variant="secondary" size="icon-sm">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        {profile?.bio && (
          <p className="text-white/80 text-sm text-center max-w-xs leading-relaxed">
            {profile.bio}
          </p>
        )}
        {profile?.website && (
          <a
            href={profile.website}
            className="text-[#69C9D0] text-sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            {profile.website.replace(/^https?:\/\//, '')}
          </a>
        )}
      </div>

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

      {/* Video grid placeholder */}
      <div className="grid grid-cols-3 gap-0.5">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[9/16] bg-white/5 relative overflow-hidden"
            style={{
              backgroundImage: `url(https://picsum.photos/seed/vid${i}/400/700)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute bottom-1 left-1 flex items-center gap-0.5">
              <Heart className="w-3 h-3 text-white fill-white" />
              <span className="text-white text-xs font-semibold drop-shadow">
                {formatCount(Math.floor(Math.random() * 100000 + 1000))}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
