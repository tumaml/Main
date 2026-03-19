import { BottomNav } from '@/components/shared/BottomNav'

export default function DiscoverLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-black">
      {children}
      <BottomNav />
    </div>
  )
}
