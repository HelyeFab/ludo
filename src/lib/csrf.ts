import { cookies } from "next/headers";

/**
 * Generate a CSRF token
 * @returns A random CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomUUID();
}

/**
 * Set CSRF token in cookies
 * @param token - The token to set
 */
export async function setCsrfToken(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("csrf_token", token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60, // 1 hour
  });
}

/**
 * Verify CSRF token from request
 * @param token - Token from request body/headers
 * @returns true if valid, false otherwise
 */
export async function verifyCsrfToken(token: string | null | undefined): Promise<boolean> {
  if (!token) {
    return false;
  }

  const cookieStore = await cookies();
  const csrfCookie = cookieStore.get("csrf_token");

  return csrfCookie?.value === token;
}

/**
 * Get CSRF token from cookies
 * @returns The CSRF token or null
 */
export async function getCsrfToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const csrfCookie = cookieStore.get("csrf_token");
  return csrfCookie?.value || null;
}

/**
 * Refresh CSRF token - generates new token and sets it in cookies
 * This should be called after each successful mutating request for defense in depth
 * @returns The new CSRF token
 */
export async function refreshCsrfToken(): Promise<string> {
  const newToken = generateCsrfToken();
  await setCsrfToken(newToken);
  return newToken;
}
