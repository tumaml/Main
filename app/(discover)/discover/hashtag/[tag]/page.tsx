interface HashtagPageProps {
  params: Promise<{ tag: string }>
}

export default async function HashtagPage({ params }: HashtagPageProps) {
  const { tag } = await params
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-2 pb-20">
      <p className="text-white font-bold text-lg">#{tag}</p>
      <p className="text-white/40 text-sm">Hashtag page — Phase 2</p>
    </div>
  )
}
