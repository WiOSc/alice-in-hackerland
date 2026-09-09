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

export async function assignApisRoundRobin() {
  await getAdminDecoded();

  const apisSnapshot = await adminDb.collection('apis').orderBy('createdAt', 'asc').get();
  const apis = apisSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  if (apis.length === 0) throw new Error('No APIs have been added yet.');

  const teamsSnapshot = await adminDb.collection('users').where('role', '==', 'team').orderBy('createdAt', 'asc').get();
  if (teamsSnapshot.empty) throw new Error('No teams exist yet.');

  const batch = adminDb.batch();
  teamsSnapshot.docs.forEach((teamDoc, i) => {
    const api = apis[i % apis.length];
    batch.update(teamDoc.ref, {
      assignedApi: {
        id: api.id,
        api: (api as any).api,
        apiName: (api as any).apiName,
        problemStatement: (api as any).problemStatement,
      },
    });
  });
  await batch.commit();

  return { teamsAssigned: teamsSnapshot.size, apisUsed: apis.length };
}

export async function getMyAssignedApi() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) return null;
  const decoded = await adminAuth.verifySessionCookie(session);
  if (decoded.role !== 'team') return null;

  const doc = await adminDb.collection('users').doc(decoded.uid).get();
  return doc.data()?.assignedApi ?? null;
}

export async function updateApi(id: string, api: string, apiName: string, problemStatement: string) {
  await getAdminDecoded();
  await adminDb.collection('apis').doc(id).update({ api, apiName, problemStatement });
  return { id };
}

export async function deleteApi(id: string) {
  await getAdminDecoded();
  await adminDb.collection('apis').doc(id).delete();
  return { id };
}