import { NextResponse, NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // 1. If user has NO token → block protected routes
  if (
    !token &&
    (pathname.startsWith("/threads") || pathname.startsWith("/about"))
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 2. If user already has token → block going back to login page
  if (token && pathname === "/") {
    return NextResponse.redirect(new URL("/threads", request.url));
  }

  // 3. Otherwise → allow
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/threads/:path*", "/about/:path*"],
};
