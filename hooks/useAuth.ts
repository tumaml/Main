'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useUserStore } from '@/store/user'
import { supabase } from '@/lib/supabase'

export function useAuth() {
  const { user, isLoaded, isSignedIn } = useUser()
  const { setProfile, setLoading } = useUserStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoaded) return

    if (!isSignedIn || !user) {
      setProfile(null)
      setLoading(false)
      return
    }

    const fetchOrCreateProfile = async () => {
      setLoading(true)
      try {
        let { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('clerk_id', user.id)
          .single()

        if (!profile) {
          const username =
            user.username ||
            user.emailAddresses[0]?.emailAddress.split('@')[0] ||
            `user_${Math.random().toString(36).slice(2, 7)}`

          const { data: newProfile } = await supabase
            .from('users')
            .insert({
              clerk_id:     user.id,
              username,
              display_name: user.fullName || username,
              avatar_url:   user.imageUrl || null,
            })
            .select()
            .single()

          profile = newProfile
        }

        setProfile(profile)

        // Redirect new users (no interests set) to onboarding
        if (
          profile &&
          Array.isArray((profile as { interests?: string[] }).interests) &&
          (profile as { interests: string[] }).interests.length === 0 &&
          pathname !== '/onboarding'
        ) {
          router.replace('/onboarding')
        }
      } catch (err) {
        console.error('Failed to fetch/create profile:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrCreateProfile()
  }, [user, isLoaded, isSignedIn, setProfile, setLoading, router, pathname])

  const { profile, isLoading } = useUserStore()
  return { user, profile, isSignedIn, isLoaded, isLoading }
}
