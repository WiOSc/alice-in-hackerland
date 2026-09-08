import { requireUser, UnauthorizedError } from "./requireUser";
import type { DecodedIdToken } from "firebase-admin/auth";

export class ForbiddenError extends Error {
  constructor(message = "Admins only") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/**
 * Requires a logged-in user AND an `admin: true` custom claim on their
 * Firebase auth token. Set the claim via adminAuth.setCustomUserClaims(uid,
 * { admin: true }) from a trusted server context (e.g. a one-off script).
 */
export async function requireAdmin(): Promise<DecodedIdToken> {
  const user = await requireUser();
  if (user.admin !== true) {
    throw new ForbiddenError("This action requires an admin account.");
  }
  return user;
}

export { UnauthorizedError };
