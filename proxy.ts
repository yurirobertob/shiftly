import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Lightweight proxy - does NOT import Auth.js or Prisma
// Checks for session cookie directly to stay under Vercel Edge 1MB limit

const protectedRoutes = ["/home", "/dashboard", "/app", "/settings", "/profile", "/colaboradores", "/servicos", "/relatorios", "/fechamento", "/unidades", "/clientes", "/conquistas", "/onboarding"];
const publicRoutes = ["/login", "/pricing"];

function hasSessionCookie(request: NextRequest): boolean {
  return !!(
    request.cookies.get("authjs.session-token") ||
    request.cookies.get("__Secure-authjs.session-token")
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Root route: if logged in → redirect to /dashboard, otherwise show landing
  if (pathname === "/") {
    if (hasSessionCookie(request)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    const response = NextResponse.next();
    // Set language cookie from Accept-Language header if not already set by user
    if (!request.cookies.get("shiftsly-lang")) {
      const acceptLang = request.headers.get("accept-language") ?? "";
      const lang = acceptLang.toLowerCase().startsWith("pt") ? "pt" : "en";
      response.cookies.set("shiftsly-lang", lang, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
      });
    }
    return response;
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
