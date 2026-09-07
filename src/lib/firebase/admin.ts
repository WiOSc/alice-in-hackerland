import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const firebaseAdminConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!getApps().length && firebaseAdminConfig.privateKey) {
  try {
    initializeApp({
      credential: cert(firebaseAdminConfig as any),
    });
  } catch (error) {
    console.error('Firebase Admin Init Error:', error);
  }
}

const app = getApps().length ? getApps()[0] : null;

export const adminAuth = app ? getAuth(app) : null as unknown as ReturnType<typeof getAuth>;
export const adminDb = app ? getFirestore(app) : null as unknown as ReturnType<typeof getFirestore>;