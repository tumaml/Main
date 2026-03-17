'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect } from 'react'
import { useUserStore } from '@/store/user'
import { supabase } from '@/lib/supabase'

export function useAuth() {
  const { user, isLoaded, isSignedIn } = useUser()
  const { setProfile, setLoading } = useUserStore()

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
              clerk_id: user.id,
              username,
              display_name: user.fullName || username,
              avatar_url: user.imageUrl || null,
            })
            .select()
            .single()

          profile = newProfile
        }

        setProfile(profile)
      } catch (err) {
        console.error('Failed to fetch/create profile:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrCreateProfile()
  }, [user, isLoaded, isSignedIn, setProfile, setLoading])

  const { profile, isLoading } = useUserStore()
  return { user, profile, isSignedIn, isLoaded, isLoading }
}
