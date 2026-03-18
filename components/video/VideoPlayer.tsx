'use client'

import { useEffect, useRef, useState } from 'react'
import { Play, Pause } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePlayerStore } from '@/store/player'

interface VideoPlayerProps {
  videoId: string
  src: string
  poster?: string
  className?: string
  onEnded?: () => void
}

function isHLS(src: string) {
  return src.includes('.m3u8') || src.includes('m3u8')
}

export function VideoPlayer({ videoId, src, poster, className, onEnded }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef   = useRef<import('hls.js').default | null>(null)
  const [isBuffering, setIsBuffering] = useState(false)
  const [progress,    setProgress]    = useState(0)
  const [showControls, setShowControls] = useState(false)
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout>>()

  const { currentVideoId, isMuted, isPlaying, setCurrentVideoId, setPlaying } = usePlayerStore()
  const isActive = currentVideoId === videoId

  // Set up HLS source when src/active state changes
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (!isHLS(src)) {
      // Regular MP4/WebM — use native src attribute
      video.src = src
      return
    }

    let cancelled = false

    const attach = async () => {
      const Hls = (await import('hls.js')).default
      if (cancelled) return

      if (Hls.isSupported()) {
        // Destroy previous instance before creating a new one
        if (hlsRef.current) {
          hlsRef.current.destroy()
          hlsRef.current = null
        }
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 30,
        })
        hlsRef.current = hls
        hls.loadSource(src)
        hls.attachMedia(video)
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari native HLS
        video.src = src
      }
    }

    attach()

    return () => {
      cancelled = true
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [src])

  // Play/pause based on active state
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (isActive) {
      video.muted = isMuted
      if (isPlaying) {
        video.play().catch(() => {
          // Autoplay blocked — retry muted
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
  }, [isActive, isPlaying, isMuted])

  // Sync mute
  useEffect(() => {
    const video = videoRef.current
    if (video && isActive) video.muted = isMuted
  }, [isMuted, isActive])

  const handleVideoClick = () => {
    if (!isActive) {
      setCurrentVideoId(videoId)
      setPlaying(true)
      return
    }
    setPlaying(!isPlaying)
    setShowControls(true)
    clearTimeout(controlsTimerRef.current)
    controlsTimerRef.current = setTimeout(() => setShowControls(false), 2000)
  }

  return (
    <div className={cn('relative w-full h-full bg-black', className)} onClick={handleVideoClick}>
      <video
        ref={videoRef}
        poster={poster}
        className="w-full h-full object-cover"
        loop
        playsInline
        muted={isMuted}
        onTimeUpdate={() => {
          const v = videoRef.current
          if (v && v.duration) setProgress((v.currentTime / v.duration) * 100)
        }}
        onWaiting={() => setIsBuffering(true)}
        onCanPlay={() => setIsBuffering(false)}
        onEnded={onEnded}
        preload="metadata"
      />

      {/* Buffering spinner */}
      {isBuffering && isActive && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Play/Pause tap indicator */}
      {showControls && isActive && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/40 rounded-full p-4 backdrop-blur-sm">
            {isPlaying
              ? <Pause className="w-8 h-8 text-white" />
              : <Play  className="w-8 h-8 text-white" />}
          </div>
        </div>
      )}

      {/* Progress bar */}
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20">
          <div
            className="h-full bg-white transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}
