'use server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';
import { Timestamp } from 'firebase-admin/firestore';
import crypto from 'crypto';

async function getAdminDecoded() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) throw new Error('Unauthorized');
  const decoded = await adminAuth.verifySessionCookie(session);
  if (decoded.role !== 'admin') throw new Error('Forbidden');
  return decoded;
}

export async function listTeams() {
  await getAdminDecoded();
  const snapshot = await adminDb.collection('users').where('role', '==', 'team').get();
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      uid: doc.id,
      role: data.role,
      teamId: data.teamId ?? '',
      teamName: data.teamName ?? '',
      email: data.email ?? '',
      password: data.password ?? '',
      points: data.points ?? 0,
      qualified: data.qualified ?? true,
      createdAt: data.createdAt?.toDate?.()?.toISOString() ?? '',
    };
  });
}

export async function resetTeamPassword(uid: string) {
  await getAdminDecoded();
  const newPassword = crypto.randomBytes(6).toString('base64url');
  await adminAuth.updateUser(uid, { password: newPassword });
  await adminDb.collection('users').doc(uid).update({ password: newPassword });
  return { newPassword };
}

export async function updateTeamPoints(uid: string, points: number) {
  await getAdminDecoded();
  await adminDb.collection('users').doc(uid).update({ points });
  return { points };
}

export async function toggleTeamQualified(uid: string, qualified: boolean) {
  await getAdminDecoded();
  await adminDb.collection('users').doc(uid).update({ qualified });
  return { qualified };
}