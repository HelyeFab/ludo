import { NextResponse } from "next/server";
import { generateCsrfToken, setCsrfToken } from "@/lib/csrf";
import { getVerifiedAdminSession } from "@/lib/dal";

/**
 * GET endpoint to retrieve CSRF token for authenticated admins
 */
export async function GET() {
  try {
    await getVerifiedAdminSession();
  } catch {
    return NextResponse.json(
      { error: "Unauthorized: Admin authentication required" },
      { status: 403 }
    );
  }

  const token = generateCsrfToken();
  await setCsrfToken(token);

  return NextResponse.json({ csrfToken: token });
}
