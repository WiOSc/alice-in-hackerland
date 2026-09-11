import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

// NOTE: If you already have lib/firebase/admin.ts wired up, keep your version —
// this is provided so the rounds/leaderboard modules have something to import
// against. Requires these env vars (server-only, never NEXT_PUBLIC_):
//   FIREBASE_PROJECT_ID
//   FIREBASE_CLIENT_EMAIL
//   FIREBASE_PRIVATE_KEY  (with \n escaped, e.g. from a single-line .env value)

function getAdminApp(): App {
  const existing = getApps();
  if (existing.length > 0) return existing[0];

  let formattedKey = process.env.FIREBASE_PRIVATE_KEY;
  if (formattedKey) {
    formattedKey = formattedKey.replace(/\\n/g, '\n');
    if (formattedKey.startsWith('"') && formattedKey.endsWith('"')) {
      formattedKey = formattedKey.slice(1, -1);
    }
  }

  try {
    return initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: formattedKey,
      }),
    });
  } catch (err: any) {
    console.error("IREBASE ADMIN INIT FAILED ");
    console.error("Error:", err.message);
    console.error("Project ID:", process.env.FIREBASE_PROJECT_ID);
    console.error("Client Email:", process.env.FIREBASE_CLIENT_EMAIL);
    console.error("Private Key snippet:", process.env.FIREBASE_PRIVATE_KEY?.substring(0, 40));
    throw err;
  }
}

export const adminApp = getAdminApp();
export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);
