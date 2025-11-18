import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log("[PROXY] Checking:", pathname);

  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminApiRoute = pathname.startsWith("/api/admin");

  if (!isAdminRoute && !isAdminApiRoute) {
    return NextResponse.next();
  }

  const adminAuth = request.cookies.get("admin_auth");
  console.log("[PROXY] Auth cookie:", adminAuth?.value);

  if (!adminAuth || adminAuth.value !== "1") {
    console.log("[PROXY] Redirecting to /login");
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/admin") {
      loginUrl.searchParams.set("from", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  console.log("[PROXY] Allowing access");
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
