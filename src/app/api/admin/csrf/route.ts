import { NextResponse } from "next/server";
import { generateCsrfToken, setCsrfToken } from "@/lib/csrf";

/**
 * GET endpoint to retrieve CSRF token for authenticated admins
 * Note: This route is already protected by middleware, so no need to check auth here
 */
export async function GET() {
  const token = generateCsrfToken();
  await setCsrfToken(token);

  return NextResponse.json({ csrfToken: token });
}
