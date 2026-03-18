// Seller dashboard has its own nav — no consumer BottomNav
export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-black">
      {children}
    </div>
  )
}
