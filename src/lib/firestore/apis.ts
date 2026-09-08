'use server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';
import { Timestamp } from 'firebase-admin/firestore';

async function getAdminDecoded() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) throw new Error('Unauthorized');
  const decoded = await adminAuth.verifySessionCookie(session);
  if (decoded.role !== 'admin') throw new Error('Forbidden');
  return decoded;
}

export async function addApi(api: string, apiName: string, problemStatement: string) {
  await getAdminDecoded();
  const docRef = await adminDb.collection('apis').add({
    api,
    apiName,
    problemStatement,
    createdAt: Timestamp.now(),
  });
  return { id: docRef.id };
}

export async function listApis() {
  const snapshot = await adminDb.collection('apis').orderBy('createdAt', 'desc').get();
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      api: data.api ?? '',
      apiName: data.apiName ?? '',
      problemStatement: data.problemStatement ?? '',
      createdAt: data.createdAt?.toDate?.()?.toISOString() ?? '',
    };
  });
}