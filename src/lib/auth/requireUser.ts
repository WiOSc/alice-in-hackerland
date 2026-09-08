import { getSessionUser } from "../../lib/firebase/auth";
import type { DecodedIdToken } from "firebase-admin/auth";

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/**
 * Throws UnauthorizedError if there's no valid logged-in user.
 * Use inside API route handlers wrapped in try/catch, or in server
 * components where you catch and redirect to /login.
 */
export async function requireUser(): Promise<DecodedIdToken> {
  const user = await getSessionUser();
  if (!user) throw new UnauthorizedError("You must be logged in.");
  return user;
}
