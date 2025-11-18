import { NextResponse } from "next/server";
import { generateCsrfToken, setCsrfToken } from "@/lib/csrf";
import { isAdminAuthenticated } from "@/lib/auth";

/**
 * GET endpoint to retrieve CSRF token for authenticated admins
 */
export async function GET() {
  // Only provide CSRF tokens to authenticated users
  const isAuthenticated = await isAdminAuthenticated();

  if (!isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = generateCsrfToken();
  await setCsrfToken(token);

  return NextResponse.json({ csrfToken: token });
}
