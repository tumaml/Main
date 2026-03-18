import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

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

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    const { userId, redirectToSignIn } = auth()
    if (!userId) return redirectToSignIn()
  }
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
