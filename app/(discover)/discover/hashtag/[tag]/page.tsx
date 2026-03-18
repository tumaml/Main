interface HashtagPageProps {
  params: { tag: string }
}

export default function HashtagPage({ params }: HashtagPageProps) {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-2 pb-20">
      <p className="text-white font-bold text-lg">#{params.tag}</p>
      <p className="text-white/40 text-sm">Hashtag page — Phase 2</p>
    </div>
  )
}
