import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// /api/prices/refresh is protected by internal secret, not Clerk
const isPublicRoute = createRouteMatcher([
  '/',
  '/api/prices/refresh',
])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
