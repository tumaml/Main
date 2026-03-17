import { create } from 'zustand'
import { Video } from '@/types/database'

interface PlayerState {
  currentVideoId: string | null
  isMuted: boolean
  isPlaying: boolean
  volume: number
  feedVideos: Video[]
  currentIndex: number

  setCurrentVideoId: (id: string | null) => void
  setMuted: (muted: boolean) => void
  toggleMute: () => void
  setPlaying: (playing: boolean) => void
  setFeedVideos: (videos: Video[]) => void
  setCurrentIndex: (index: number) => void
  addFeedVideos: (videos: Video[]) => void
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentVideoId: null,
  isMuted: true, // Start muted for autoplay policies
  isPlaying: true,
  volume: 1,
  feedVideos: [],
  currentIndex: 0,

  setCurrentVideoId: (id) => set({ currentVideoId: id }),
  setMuted: (muted) => set({ isMuted: muted }),
  toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),
  setPlaying: (playing) => set({ isPlaying: playing }),
  setFeedVideos: (videos) => set({ feedVideos: videos }),
  setCurrentIndex: (index) => set({ currentIndex: index }),
  addFeedVideos: (videos) =>
    set((s) => ({
      feedVideos: [...s.feedVideos, ...videos],
    })),
}))
