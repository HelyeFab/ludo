import "server-only";
import { cache } from "react";
import { getSession, isAdminAuthenticated, isAuthenticated } from "./session";
import type { SessionData as IronSessionData } from "./session";

/**
 * Data Access Layer (DAL) for authentication
 *
 * This centralizes all authentication checks following Next.js 2025 best practices.
 * Per CVE-2025-29927, never rely solely on middleware for authentication.
 */

export type SessionData = {
  isAuthenticated: boolean;
  role: "admin" | "viewer" | null;
  userId: string | null;
};

/**
 * Verifies the current session
 * @returns Session data with authentication status
 *
 * This function is cached per request to avoid multiple session reads
 */
export const verifySessionDAL = cache(async (): Promise<SessionData> => {
  const session = await getSession();

  if (!session.isLoggedIn) {
    return { isAuthenticated: false, role: null, userId: null };
  }

  return {
    isAuthenticated: true,
    role: session.role || null,
    userId: session.userId || null,
  };
});

/**
 * Gets the verified admin session or throws an error
 * @throws Error if not authenticated as admin
 * @returns Session data
 */
export async function getVerifiedAdminSession(): Promise<SessionData> {
  const isAdmin = await isAdminAuthenticated();

  if (!isAdmin) {
    throw new Error("Unauthorized: Admin authentication required");
  }

  return verifySessionDAL();
}

/**
 * Gets the verified session (admin or viewer) or throws an error
 * @throws Error if not authenticated
 * @returns Session data
 */
export async function getVerifiedSession(): Promise<SessionData> {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    throw new Error("Unauthorized: Authentication required");
  }

  return verifySessionDAL();
}
