import { BottomNav } from '@/components/shared/BottomNav'

export default function FeedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full h-[100dvh] bg-black overflow-hidden">
      {children}
      <BottomNav />
    </div>
  )
}
