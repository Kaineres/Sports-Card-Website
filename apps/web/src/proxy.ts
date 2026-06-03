import { clerkMiddleware } from '@clerk/nextjs/server'

// NOTE: During early build-out, every section is publicly accessible so all
// pages can be navigated and reviewed without signing in. Clerk auth context
// is still attached (useUser, sign-in buttons, etc. work) — it just doesn't
// gate any routes. Before launch, re-introduce protection, e.g.:
//
//   const isPublicRoute = createRouteMatcher(['/', '/market', '/browse',
//     '/grading', '/grading/scanner-test', '/api/prices/refresh'])
//   export default clerkMiddleware(async (auth, request) => {
//     if (!isPublicRoute(request)) await auth.protect()  // gate /collection, /watchlist
//   })
export default clerkMiddleware()

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
