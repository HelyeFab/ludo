import { cookies } from "next/headers";

// Session storage - in production, use Redis or a database
// Using globalThis to persist across hot reloads in development
const globalForSessions = globalThis as unknown as {
  sessions: Map<string, { createdAt: number; expiresAt: number; lastActivity: number }> | undefined;
  viewerSessions: Map<string, { createdAt: number; expiresAt: number; lastActivity: number }> | undefined;
  cleanupInterval: NodeJS.Timeout | undefined;
};

if (!globalForSessions.sessions) {
  globalForSessions.sessions = new Map();
}

if (!globalForSessions.viewerSessions) {
  globalForSessions.viewerSessions = new Map();
}

const sessions = globalForSessions.sessions;
const viewerSessions = globalForSessions.viewerSessions;

// Clean up expired sessions periodically (only start once)
if (!globalForSessions.cleanupInterval) {
  globalForSessions.cleanupInterval = setInterval(() => {
    const now = Date.now();
    // Clean admin sessions
    for (const [token, session] of sessions.entries()) {
      if (session.expiresAt < now) {
        sessions.delete(token);
      }
    }
    // Clean viewer sessions
    for (const [token, session] of viewerSessions.entries()) {
      if (session.expiresAt < now) {
        viewerSessions.delete(token);
      }
    }
  }, 60 * 60 * 1000); // Clean up every hour
}

/**
 * Creates a new session
 * @returns Session token
 */
export function createSession(): string {
  const token = crypto.randomUUID();
  const now = Date.now();
  const expiresAt = now + 30 * 24 * 60 * 60 * 1000; // 30 days

  sessions.set(token, {
    createdAt: now,
    expiresAt,
    lastActivity: now,
  });

  return token;
}

/**
 * Verifies a session token
 * @param token - Session token to verify
 * @returns true if valid, false otherwise
 */
export function verifySession(token: string | undefined): boolean {
  if (!token) return false;

  const session = sessions.get(token);
  if (!session) return false;

  const now = Date.now();
  if (session.expiresAt < now) {
    sessions.delete(token);
    return false;
  }

  // Update last activity
  session.lastActivity = now;
  return true;
}

/**
 * Invalidates a session
 * @param token - Session token to invalidate
 */
export function invalidateSession(token: string): void {
  sessions.delete(token);
}

/**
 * Verifies admin authentication from cookies
 * @throws Error if not authenticated
 */
export async function verifyAdminAuth(): Promise<void> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("admin_session");

  if (!sessionCookie || !verifySession(sessionCookie.value)) {
    throw new Error("Unauthorized: Admin authentication required");
  }
}

/**
 * Checks if user is authenticated (non-throwing version)
 * @returns true if authenticated, false otherwise
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("admin_session");
  return sessionCookie ? verifySession(sessionCookie.value) : false;
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

/**
 * Creates a new viewer session
 * @returns Session token
 */
export function createViewerSession(): string {
  const token = crypto.randomUUID();
  const now = Date.now();
  const expiresAt = now + 30 * 24 * 60 * 60 * 1000; // 30 days

  viewerSessions.set(token, {
    createdAt: now,
    expiresAt,
    lastActivity: now,
  });

  return token;
}

/**
 * Verifies a viewer session token
 * @param token - Session token to verify
 * @returns true if valid, false otherwise
 */
export function verifyViewerSession(token: string | undefined): boolean {
  if (!token) return false;

  const session = viewerSessions.get(token);
  if (!session) return false;

  const now = Date.now();
  if (session.expiresAt < now) {
    viewerSessions.delete(token);
    return false;
  }

  // Update last activity
  session.lastActivity = now;
  return true;
}

/**
 * Invalidates a viewer session
 * @param token - Session token to invalidate
 */
export function invalidateViewerSession(token: string): void {
  viewerSessions.delete(token);
}

/**
 * Checks if viewer is authenticated (non-throwing version)
 * @returns true if authenticated, false otherwise
 */
export async function isViewerAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("viewer_session");
  return sessionCookie ? verifyViewerSession(sessionCookie.value) : false;
}
