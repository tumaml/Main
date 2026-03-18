interface UserProfilePageProps {
  params: { username: string }
}

export default function UserProfilePage({ params }: UserProfilePageProps) {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-2 pb-20">
      <p className="text-white font-bold text-lg">@{params.username}</p>
      <p className="text-white/40 text-sm">Public profile — Phase 1 (Commit 3)</p>
    </div>
  )
}
