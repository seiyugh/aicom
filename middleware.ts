import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === "/login"

  // Get the token from the cookies
  const token = request.cookies.get("token")?.value || ""

  // Check for mock user in localStorage (for development)
  const hasMockUser = request.cookies.has("mockUser")

  // Redirect logic for authentication
  if (isPublicPath && (token || hasMockUser)) {
    // If user is on a public path but has a token or mock user, redirect to dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  if (!isPublicPath && !token && !hasMockUser) {
    // If user is on a protected path but doesn't have a token or mock user, redirect to login
    // But don't redirect if we're already in the process of redirecting (prevents loops)
    const referer = request.headers.get("referer") || ""
    if (referer.includes("/login")) {
      // We're already coming from login, don't redirect again
      return NextResponse.next()
    }
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // No role-based restrictions - all authenticated users have full access
  return NextResponse.next()
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    "/",
    "/login",
    "/dashboard/:path*",
    "/employees/:path*",
    "/payroll/:path*",
    "/time-entries/:path*",
    "/profile/:path*",
    "/settings/:path*",
  ],
}

