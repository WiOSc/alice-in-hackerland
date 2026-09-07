'use server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function createTeamAccount(email: string, teamId: string, teamName: string) {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) throw new Error('Unauthorized');

  const decoded = await adminAuth.verifySessionCookie(session);
  if (decoded.role !== 'admin') throw new Error('Forbidden');

  const tempPassword = crypto.randomBytes(6).toString('base64url');
  const userRecord = await adminAuth.createUser({ email, password: tempPassword });
  await adminAuth.setCustomUserClaims(userRecord.uid, { role: 'team' });

  await adminDb.collection('users').doc(userRecord.uid).set({
    role: 'team',
    teamId,
    teamName,
    email,
    password: tempPassword,
    createdAt: new Date(),
  });

  console.log(`Temp password for ${email}: ${tempPassword}`);
  return { uid: userRecord.uid };
}