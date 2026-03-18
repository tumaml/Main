import { NextResponse } from 'next/server'

// 100ms.live webhook handler — Phase 5
// Events: room.ended, peer.join, peer.leave, recording.success
export async function POST() {
  return NextResponse.json(
    { error: '100ms webhook handler not implemented yet — Phase 5' },
    { status: 501 }
  )
}
