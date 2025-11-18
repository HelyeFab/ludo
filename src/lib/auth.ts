import { cookies } from "next/headers";

/**
 * Verifies admin authentication from cookies
 * @throws Error if not authenticated
 */
export async function verifyAdminAuth(): Promise<void> {
  const cookieStore = await cookies();
  const adminAuth = cookieStore.get("admin_auth");

  if (!adminAuth || adminAuth.value !== "1") {
    throw new Error("Unauthorized: Admin authentication required");
  }
}

/**
 * Checks if user is authenticated (non-throwing version)
 * @returns true if authenticated, false otherwise
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const adminAuth = cookieStore.get("admin_auth");
  return adminAuth?.value === "1";
}

/**
 * Validates required environment variables on startup
 * @throws Error if required variables are missing
 */
export function validateEnv(): void {
  const required = ["ADMIN_PASSWORD", "BLOB_READ_WRITE_TOKEN"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
}

// Rate limiting for login attempts (in-memory, simple implementation)
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

/**
 * Check if IP is rate limited
 * @param ip - IP address to check
 * @returns true if rate limited, false otherwise
 */
export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const attempt = loginAttempts.get(ip);

  if (!attempt) {
    return false;
  }

  // Reset if time window has passed (5 minutes)
  if (now > attempt.resetAt) {
    loginAttempts.delete(ip);
    return false;
  }

  // Rate limit: max 5 attempts per 5 minutes
  return attempt.count >= 5;
}

/**
 * Record a failed login attempt
 * @param ip - IP address of the attempt
 */
export function recordLoginAttempt(ip: string): void {
  const now = Date.now();
  const attempt = loginAttempts.get(ip);

  if (!attempt || now > attempt.resetAt) {
    // New attempt or expired window
    loginAttempts.set(ip, {
      count: 1,
      resetAt: now + 5 * 60 * 1000, // 5 minutes
    });
  } else {
    // Increment existing attempt
    attempt.count++;
  }
}

/**
 * Clear login attempts for an IP (on successful login)
 * @param ip - IP address to clear
 */
export function clearLoginAttempts(ip: string): void {
  loginAttempts.delete(ip);
}
