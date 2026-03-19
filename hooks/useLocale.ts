'use client'

import { useState, useEffect, useCallback } from 'react'

export type Locale = 'ar' | 'en'

const STORAGE_KEY = 'mezan-locale'

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>('ar')

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null
    if (saved === 'ar' || saved === 'en') {
      setLocaleState(saved)
      document.documentElement.lang = saved
      document.documentElement.dir = saved === 'ar' ? 'rtl' : 'ltr'
    } else {
      // Default to Arabic
      document.documentElement.lang = 'ar'
      document.documentElement.dir = 'rtl'
    }
  }, [])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    localStorage.setItem(STORAGE_KEY, next)
    document.documentElement.lang = next
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr'
  }, [])

  const toggleLocale = useCallback(() => {
    setLocale(locale === 'ar' ? 'en' : 'ar')
  }, [locale, setLocale])

  return { locale, setLocale, toggleLocale, isRTL: locale === 'ar' }
}
