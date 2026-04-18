import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Lightweight middleware - does NOT import Auth.js or Prisma
// Checks for session cookie directly to stay under Vercel Edge 1MB limit

const protectedRoutes = ["/home", "/dashboard", "/app", "/settings", "/profile", "/colaboradores", "/servicos", "/relatorios", "/fechamento", "/unidades", "/clientes", "/conquistas"];
const publicRoutes = ["/login", "/pricing"];

function hasSessionCookie(request: NextRequest): boolean {
  return !!(
    request.cookies.get("authjs.session-token") ||
    request.cookies.get("__Secure-authjs.session-token")
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Root route: if logged in → redirect to /dashboard, otherwise show landing
  if (pathname === "/") {
    if (hasSessionCookie(request)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Redirect /home to /dashboard (home uses mock data, dashboard has real data)
  if (pathname === "/home") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Allow auth API routes
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Check if the route is protected
  const isProtected = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtected) {
    if (!hasSessionCookie(request)) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
