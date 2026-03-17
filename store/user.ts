import { create } from 'zustand'
import { User } from '@/types/database'

interface UserState {
  profile: User | null
  isLoading: boolean
  setProfile: (user: User | null) => void
  setLoading: (loading: boolean) => void
  updateProfile: (updates: Partial<User>) => void
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  isLoading: true,
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  updateProfile: (updates) =>
    set((s) => ({ profile: s.profile ? { ...s.profile, ...updates } : null })),
}))
