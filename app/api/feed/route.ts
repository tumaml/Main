import { NextResponse } from 'next/server'

// Feed algorithm endpoint — Phase 7
// Will replace /api/videos for scored/ranked feed delivery
export async function GET() {
  return NextResponse.json(
    { error: 'Feed algorithm not implemented yet — Phase 7' },
    { status: 501 }
  )
}
