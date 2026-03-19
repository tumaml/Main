import { NextResponse } from 'next/server'

// Stripe checkout — Phase 3
export async function POST() {
  return NextResponse.json({ error: 'Checkout not implemented yet — Phase 3' }, { status: 501 })
}
