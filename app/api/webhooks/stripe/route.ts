import { NextResponse } from 'next/server'

// Stripe webhook handler — Phase 3
// Events: payment_intent.succeeded, checkout.session.completed, account.updated
export async function POST() {
  return NextResponse.json(
    { error: 'Stripe webhook handler not implemented yet — Phase 3' },
    { status: 501 }
  )
}
