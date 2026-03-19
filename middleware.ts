import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  // Feed
  '/',
  '/following',
  '/friends',
  '/local',
  '/video/(.*)',
  // Discover
  '/discover(.*)',
  // Auth
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/onboarding',
  // Public profiles
  '/profile/(.*)',
  // Shop — browsing is public, checkout requires auth
  '/shop',
  '/shop/product/(.*)',
  '/shop/store/(.*)',
  // API — public read endpoints
  '/api/videos(.*)',
  '/api/users(.*)',
  '/api/comments(.*)',
  '/api/shop/products(.*)',
  '/api/feed(.*)',
  // Webhooks — validated by their own secrets
  '/api/webhooks(.*)',
])

// If Clerk keys are not configured, skip auth middleware entirely
const clerkEnabled =
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  !!process.env.CLERK_SECRET_KEY

export default clerkEnabled
  ? clerkMiddleware(async (auth, request) => {
      if (!isPublicRoute(request)) {
        const { userId, redirectToSignIn } = await auth()
        if (!userId) return redirectToSignIn()
      }
    })
  : () => NextResponse.next()

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
