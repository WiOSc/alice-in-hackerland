import { cookies } from "next/headers";
import { adminAuth } from "./admin";
import type { DecodedIdToken } from "firebase-admin/auth";

const SESSION_COOKIE_NAME = "session";

/**
 * Reads the session cookie set at login and verifies it against Firebase.
 * Returns null if there's no valid session — callers decide how to react
 * (redirect for pages, 401 for API routes).
 */
export async function getSessionUser(): Promise<DecodedIdToken | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return null;

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    return decoded;
  } catch {
    return null;
  }
}

export { SESSION_COOKIE_NAME };
