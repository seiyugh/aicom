import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath = path === "/login";

  // Get the token from the cookies (ensure it's the same key used in auth context)
  const token = request.cookies.get("auth_token")?.value || "";

  console.log("Middleware: Path ->", path);
  console.log("Middleware: Token ->", token ? "Exists" : "Not Found");

  // If user is already authenticated, prevent access to login page
  if (isPublicPath && token) {
    console.log("Redirecting authenticated user to dashboard...");
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If the user is unauthenticated and trying to access a private route, redirect to login
  if (!isPublicPath && !token) {
    const referer = request.headers.get("referer") || "";
    if (referer.includes("/login")) {
      console.log("User is coming from login, avoiding redirect loop.");
      return NextResponse.next();
    }

    console.log("Redirecting unauthenticated user to login...");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/employees/:path*",
    "/payroll/:path*",
    "/time-entries/:path*",
    "/profile/:path*",
    "/settings/:path*",
  ],
};
