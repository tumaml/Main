'use client'

import Link from 'next/link'
import { Search, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocale } from '@/hooks/useLocale'

export type FeedTab = 'fyp' | 'following' | 'friends' | 'local'

export type FeedFilter = 'all' | 'product' | 'service' | 'under10' | 'used' | 'new'

interface FeedHeaderProps {
  activeTab: FeedTab
  onTabChange: (tab: FeedTab) => void
  activeFilter?: FeedFilter
  onFilterChange?: (filter: FeedFilter) => void
}

export function FeedHeader({ activeTab, onTabChange, activeFilter = 'all', onFilterChange }: FeedHeaderProps) {
  const { locale, toggleLocale } = useLocale()

  const TABS: { id: FeedTab; label: string }[] = [
    { id: 'following', label: locale === 'ar' ? 'المتابَعون' : 'Following' },
    { id: 'fyp', label: locale === 'ar' ? 'لك' : 'For You' },
    { id: 'friends', label: locale === 'ar' ? 'الأصدقاء' : 'Friends' },
    { id: 'local', label: locale === 'ar' ? 'قريب منك' : 'Nearby' },
  ]

  const FILTERS: { id: FeedFilter; label: string }[] = [
    { id: 'all', label: locale === 'ar' ? 'الكل' : 'All' },
    { id: 'product', label: locale === 'ar' ? 'منتجات' : 'Products' },
    { id: 'service', label: locale === 'ar' ? 'خدمات' : 'Services' },
    { id: 'under10', label: locale === 'ar' ? 'أقل من ١٠ د.أ' : 'Under 10 JOD' },
    { id: 'used', label: locale === 'ar' ? 'مستعمل' : 'Used' },
    { id: 'new', label: locale === 'ar' ? 'جديد' : 'New' },
  ]

  return (
    <div className="fixed top-0 left-0 right-0 z-40 pointer-events-none">
      {/* Top row: inbox · tabs · locale + search */}
      <div className="flex items-center justify-between px-4 pt-safe pointer-events-none">
        <Link href="/inbox" className="pointer-events-auto w-8 flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-white drop-shadow-md" />
        </Link>

        <div className="pointer-events-auto flex items-center justify-center gap-5 h-12 overflow-x-auto hide-scrollbar">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={cn(
                'text-sm font-semibold transition-all pb-1 border-b-2 whitespace-nowrap drop-shadow-md',
                activeTab === id
                  ? 'text-white border-white'
                  : 'text-white/60 border-transparent hover:text-white/80'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          {/* Locale toggle */}
          <button
            onClick={toggleLocale}
            className="text-white/70 text-xs font-bold drop-shadow-md hover:text-white transition-colors"
          >
            {locale === 'ar' ? 'EN' : 'عربي'}
          </button>
          <Link href="/discover" className="flex items-center justify-center">
            <Search className="w-5 h-5 text-white drop-shadow-md" />
          </Link>
        </div>
      </div>

      {/* Filter row */}
      {onFilterChange && (
        <div className="pointer-events-auto flex gap-2 px-3 pb-2 overflow-x-auto hide-scrollbar">
          {FILTERS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => onFilterChange(id)}
              className={cn(
                'flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border',
                activeFilter === id
                  ? 'bg-white text-black border-white'
                  : 'bg-black/40 backdrop-blur-sm text-white/70 border-white/20 hover:text-white hover:border-white/40'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
