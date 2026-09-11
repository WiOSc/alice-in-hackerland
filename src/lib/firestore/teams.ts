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
      assignedApi: data.assignedApi ?? null,
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

export async function adjustTeamPoints(params: {
  teamId: string;
  roundId: string;
  points: number;
  note?: string;
  adminUid: string;
}) {
  const { teamId, roundId, points, note, adminUid } = params;
  
  // Find the user document corresponding to this teamId
  const snapshot = await adminDb.collection('users').where('teamId', '==', teamId).where('role', '==', 'team').get();
  
  let docRef: FirebaseFirestore.DocumentReference;
  if (!snapshot.empty) {
    docRef = snapshot.docs[0].ref;
  } else {
    docRef = adminDb.collection('users').doc(teamId);
  }

  const scoreRef: FirebaseFirestore.DocumentReference = docRef.collection('roundScores').doc(roundId);
  const now = new Date().toISOString();

  await adminDb.runTransaction(async (tx) => {
    const teamDoc = await tx.get(docRef);
    if (!teamDoc.exists) throw new Error("Team not found");

    const scoreDoc = await tx.get(scoreRef);
    const previousRoundPoints = scoreDoc.exists ? (scoreDoc.data()?.points ?? 0) : 0;

    const entry = {
      roundId,
      points: previousRoundPoints + points,
      note,
      updatedAt: now,
      updatedBy: adminUid,
    };

    tx.set(scoreRef, entry, { merge: true });

    const currentTotal = teamDoc.data()?.points ?? 0;
    tx.update(docRef, {
      points: currentTotal + points,
      updatedAt: now,
    });
  });

  const updated = await docRef.get();
  return { uid: updated.id, ...updated.data() };
}

export async function getRoundPointsForTeam(uid: string, roundId: string): Promise<number> {
  const doc = await adminDb
    .collection('users')
    .doc(uid)
    .collection('roundScores')
    .doc(roundId)
    .get();

  if (!doc.exists) return 0;
  return doc.data()?.points ?? 0;
}