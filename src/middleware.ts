import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log("[MIDDLEWARE] Checking:", pathname);

  // Check viewer authentication for all routes except /enter and /api/auth/viewer
  const isEnterPage = pathname === "/enter";
  const isViewerAuthApi = pathname === "/api/auth/viewer";
  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminApiRoute = pathname.startsWith("/api/admin");
  const isLoginRoute = pathname === "/login";
  const isAdminAuthApi = pathname === "/api/auth/login";

  // Allow access to viewer auth routes
  if (isEnterPage || isViewerAuthApi) {
    console.log("[MIDDLEWARE] Allowing access to viewer auth routes");
    return NextResponse.next();
  }

  // Check for iron-session cookie (ludo_session) for all routes
  if (!isAdminRoute && !isAdminApiRoute && !isLoginRoute && !isAdminAuthApi) {
    const session = request.cookies.get("ludo_session");
    console.log("[MIDDLEWARE] Session cookie:", session?.value ? "present" : "missing");

    if (!session || !session.value) {
      console.log("[MIDDLEWARE] No session cookie, redirecting to /enter");
      return NextResponse.redirect(new URL("/enter", request.url));
    }

    console.log("[MIDDLEWARE] Session cookie found, allowing access");
  }

  // Admin routes need admin authentication
  if (!isAdminRoute && !isAdminApiRoute) {
    return NextResponse.next();
  }

  // Check for session cookie (iron-session validates role server-side)
  const sessionCookie = request.cookies.get("ludo_session");

  console.log("[MIDDLEWARE] Admin route - session cookie present:", !!sessionCookie);

  if (!sessionCookie || !sessionCookie.value) {
    console.log("[MIDDLEWARE] No session, redirecting to /login");
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/admin") {
      loginUrl.searchParams.set("from", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  console.log("[MIDDLEWARE] Session found, allowing access");
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
