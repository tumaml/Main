// Full-screen live — no BottomNav
export default function LiveLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-[100dvh] bg-black overflow-hidden">
      {children}
    </div>
  )
}
