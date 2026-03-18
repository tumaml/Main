interface LiveRoomPageProps {
  params: { roomId: string }
}

export default function LiveRoomPage({ params }: LiveRoomPageProps) {
  return (
    <div className="w-full h-[100dvh] bg-black flex flex-col items-center justify-center gap-2">
      <p className="text-white font-bold text-lg">LIVE</p>
      <p className="text-white/40 text-sm">100ms.live streaming — Phase 5</p>
      <p className="text-white/20 text-xs">Room: {params.roomId}</p>
    </div>
  )
}
