'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Plus, ShoppingBag, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCartStore } from '@/store/cart'

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/discover', icon: Search, label: 'Discover' },
  { href: '/upload', icon: Plus, label: 'Upload', isUpload: true },
  { href: '/shop', icon: ShoppingBag, label: 'Shop', hasCart: true },
  { href: '/profile', icon: User, label: 'Profile' },
]

export function BottomNav() {
  const pathname = usePathname()
  const totalItems = useCartStore((s) => s.totalItems())

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-t border-white/10 pb-safe">
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto px-2">
        {navItems.map(({ href, icon: Icon, label, isUpload, hasCart }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 min-w-[48px] py-1 transition-all',
                isUpload && 'relative'
              )}
            >
              {isUpload ? (
                <div className="relative flex items-center">
                  {/* Upload button with gradient */}
                  <div className="w-12 h-8 rounded-lg overflow-hidden flex">
                    <div className="w-1/2 bg-[#69C9D0]" />
                    <div className="w-1/2 bg-[#EE1D52]" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-9 h-6 bg-black rounded-md flex items-center justify-center">
                      <Plus className="w-4 h-4 text-white font-bold" />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Icon
                      className={cn(
                        'w-6 h-6 transition-colors',
                        isActive ? 'text-white' : 'text-white/60'
                      )}
                      fill={isActive ? 'currentColor' : 'none'}
                      strokeWidth={isActive ? 0 : 1.5}
                    />
                    {hasCart && totalItems > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#FE2C55] rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                        {totalItems > 9 ? '9+' : totalItems}
                      </span>
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-[10px] font-medium transition-colors',
                      isActive ? 'text-white' : 'text-white/60'
                    )}
                  >
                    {label}
                  </span>
                </>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
