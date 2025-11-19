import { getIronSession, IronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  userId?: string;
  role?: "admin" | "viewer";
  createdAt?: number;
  isLoggedIn: boolean;
}

// Validate SESSION_SECRET exists
if (!process.env.SESSION_SECRET) {
  throw new Error(
    "SESSION_SECRET is not set. Generate one with: openssl rand -base64 32"
  );
}

if (process.env.SESSION_SECRET.length < 32) {
  throw new Error(
    "SESSION_SECRET must be at least 32 characters long for security"
  );
}

// Session configuration
export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET,
  cookieName: "ludo_session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  },
};

/**
 * Gets the current session
 */
export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

/**
 * Creates an admin session
 */
export async function createAdminSession(): Promise<void> {
  const session = await getSession();
  session.userId = "admin";
  session.role = "admin";
  session.createdAt = Date.now();
  session.isLoggedIn = true;
  await session.save();
}

/**
 * Creates a viewer session
 */
export async function createViewerSession(): Promise<void> {
  const session = await getSession();
  session.userId = "viewer";
  session.role = "viewer";
  session.createdAt = Date.now();
  session.isLoggedIn = true;
  await session.save();
}

/**
 * Checks if user is authenticated as admin
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session.isLoggedIn === true && session.role === "admin";
}

/**
 * Checks if user is authenticated as viewer
 */
export async function isViewerAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session.isLoggedIn === true && session.role === "viewer";
}

/**
 * Checks if user has any authentication (viewer or admin)
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session.isLoggedIn === true;
}

/**
 * Verifies admin authentication (throws if not authenticated)
 */
export async function verifyAdminAuth(): Promise<void> {
  if (!(await isAdminAuthenticated())) {
    throw new Error("Unauthorized: Admin authentication required");
  }
}

/**
 * Verifies any authentication (viewer or admin)
 */
export async function verifyAuth(): Promise<void> {
  if (!(await isAuthenticated())) {
    throw new Error("Unauthorized: Authentication required");
  }
}

/**
 * Destroys the current session
 */
export async function destroySession(): Promise<void> {
  const session = await getSession();
  session.destroy();
}
