// No BottomNav — create flow is full-screen
export default function CreateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-black">
      {children}
    </div>
  )
}
