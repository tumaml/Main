'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { usePlayerStore } from '@/store/player'

export function useVideoPlayer(videoId: string) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isBuffering, setIsBuffering] = useState(false)

  const { isMuted, isPlaying, currentVideoId, toggleMute, setCurrentVideoId, setPlaying } =
    usePlayerStore()

  const isActive = currentVideoId === videoId

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (isActive) {
      video.muted = isMuted
      if (isPlaying) {
        video.play().catch(() => {
          // Autoplay blocked — stay muted and try again
          video.muted = true
          video.play().catch(() => {})
        })
      } else {
        video.pause()
      }
    } else {
      video.pause()
      video.currentTime = 0
    }
  }, [isActive, isPlaying, isMuted, videoId])

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current
    if (video) setCurrentTime(video.currentTime)
  }, [])

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current
    if (video) {
      setDuration(video.duration)
      setIsLoaded(true)
    }
  }, [])

  const handleWaiting = useCallback(() => setIsBuffering(true), [])
  const handleCanPlay = useCallback(() => setIsBuffering(false), [])

  const handleClick = useCallback(() => {
    if (!isActive) {
      setCurrentVideoId(videoId)
    } else {
      setPlaying(!isPlaying)
    }
  }, [isActive, videoId, isPlaying, setCurrentVideoId, setPlaying])

  return {
    videoRef,
    isLoaded,
    isActive,
    isBuffering,
    currentTime,
    duration,
    isMuted,
    isPlaying: isActive && isPlaying,
    toggleMute,
    handleClick,
    handleTimeUpdate,
    handleLoadedMetadata,
    handleWaiting,
    handleCanPlay,
  }
}

export function useVideoInteractions(
  videoId: string,
  initialLiked = false,
  initialLikeCount = 0,
  initialBookmarked = false
) {
  const [isLiked, setIsLiked] = useState(initialLiked)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked)

  const toggleLike = useCallback(async () => {
    // Optimistic update
    setIsLiked((prev) => !prev)
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1))

    try {
      const method = isLiked ? 'DELETE' : 'POST'
      await fetch(`/api/likes`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId }),
      })
    } catch {
      // Revert on error
      setIsLiked((prev) => !prev)
      setLikeCount((prev) => (isLiked ? prev + 1 : prev - 1))
    }
  }, [videoId, isLiked])

  const toggleBookmark = useCallback(async () => {
    setIsBookmarked((prev) => !prev)
    try {
      const method = isBookmarked ? 'DELETE' : 'POST'
      await fetch(`/api/bookmarks`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId }),
      })
    } catch {
      setIsBookmarked((prev) => !prev)
    }
  }, [videoId, isBookmarked])

  return { isLiked, likeCount, isBookmarked, toggleLike, toggleBookmark }
}

export function useFollow(targetUserId: string | undefined, initialFollowing = false) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing)

  const toggleFollow = useCallback(async () => {
    if (!targetUserId) return
    const prev = isFollowing
    setIsFollowing(!prev)
    try {
      const method = prev ? 'DELETE' : 'POST'
      await fetch('/api/follows', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId }),
      })
    } catch {
      setIsFollowing(prev)
    }
  }, [targetUserId, isFollowing])

  return { isFollowing, toggleFollow }
}
