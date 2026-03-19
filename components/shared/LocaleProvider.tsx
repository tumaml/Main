'use client'

import { useEffect } from 'react'

// Applies stored locale direction on mount (client-only)
// The actual <html> dir + lang is managed by useLocale hook,
// but we ensure it's applied on hydration here.
export function LocaleProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const saved = localStorage.getItem('mezan-locale') ?? 'ar'
    document.documentElement.lang = saved
    document.documentElement.dir = saved === 'ar' ? 'rtl' : 'ltr'
  }, [])

  return <>{children}</>
}
