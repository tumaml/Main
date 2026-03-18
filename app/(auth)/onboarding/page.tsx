'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/shared/button'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const INTERESTS = [
  { id: 'comedy',      emoji: '😂', label: 'Comedy' },
  { id: 'dance',       emoji: '💃', label: 'Dance' },
  { id: 'food',        emoji: '🍳', label: 'Food & Cooking' },
  { id: 'fashion',     emoji: '👗', label: 'Fashion & Style' },
  { id: 'travel',      emoji: '✈️', label: 'Travel' },
  { id: 'sports',      emoji: '⚽', label: 'Sports' },
  { id: 'music',       emoji: '🎵', label: 'Music' },
  { id: 'gaming',      emoji: '🎮', label: 'Gaming' },
  { id: 'beauty',      emoji: '💄', label: 'Beauty' },
  { id: 'education',   emoji: '📚', label: 'Learning' },
]

const MIN_SELECTED = 3

export default function OnboardingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [isSaving, setIsSaving] = useState(false)

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleContinue = async () => {
    if (selected.size < MIN_SELECTED) {
      toast.error(`Pick at least ${MIN_SELECTED} interests`)
      return
    }
    if (!user) return

    setIsSaving(true)
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interests: Array.from(selected) }),
      })
      if (!res.ok) throw new Error('Save failed')
      router.replace('/')
    } catch {
      toast.error('Something went wrong. Try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-black flex flex-col px-4 pb-safe">
      <div className="flex-1 pt-16 max-w-sm mx-auto w-full">
        <div className="text-center mb-10">
          <h1 className="text-white text-3xl font-black tracking-tight mb-2">
            What are you into?
          </h1>
          <p className="text-white/50 text-sm">
            Pick at least {MIN_SELECTED} to personalise your feed
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {INTERESTS.map(({ id, emoji, label }) => {
            const isSelected = selected.has(id)
            return (
              <button
                key={id}
                onClick={() => toggle(id)}
                className={cn(
                  'relative flex items-center gap-3 px-4 py-4 rounded-2xl border-2 text-left transition-all',
                  isSelected
                    ? 'bg-[#FE2C55]/15 border-[#FE2C55] text-white'
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
                )}
              >
                <span className="text-2xl">{emoji}</span>
                <span className="font-semibold text-sm">{label}</span>
                {isSelected && (
                  <span className="absolute top-2 right-2 w-5 h-5 bg-[#FE2C55] rounded-full flex items-center justify-center text-white text-xs font-bold">
                    ✓
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="py-6 max-w-sm mx-auto w-full">
        <p className="text-center text-white/30 text-xs mb-4">
          {selected.size} selected {selected.size >= MIN_SELECTED ? '✓' : `(${MIN_SELECTED - selected.size} more needed)`}
        </p>
        <Button
          onClick={handleContinue}
          disabled={selected.size < MIN_SELECTED || isSaving}
          className="w-full h-12 text-base font-bold"
        >
          {isSaving ? 'Saving…' : 'Continue to Mezan'}
        </Button>
        <button
          onClick={() => router.replace('/')}
          className="w-full text-center text-white/30 text-sm mt-3 hover:text-white/50 transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  )
}
