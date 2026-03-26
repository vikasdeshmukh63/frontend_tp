import { AUTH_SESSION_COOKIE } from "@/lib/auth-constants";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const AUTH_PAGES = [
  "/signin",
  "/signup",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAuth = request.cookies.get(AUTH_SESSION_COOKIE)?.value === "1";

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images/") ||
    /\.(?:ico|png|jpg|jpeg|gif|svg|webp|woff2?|txt)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  if (pathname === "/error-404") {
    return NextResponse.next();
  }

  if (AUTH_PAGES.includes(pathname)) {
    if (hasAuth) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (!hasAuth) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
