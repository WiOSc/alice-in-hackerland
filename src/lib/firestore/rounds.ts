import { adminDb } from "../../lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import type { CreateRoundInput, Round, UpdateRoundInput } from "../../types/round";

const ROUNDS_COLLECTION = "rounds";

export async function listRounds(): Promise<Round[]> {
  const snap = await adminDb
    .collection(ROUNDS_COLLECTION)
    .orderBy("roundNumber", "asc")
    .get();

  return snap.docs.map((doc) => doc.data() as Round);
}

export async function getActiveRound(): Promise<Round | null> {
  const snap = await adminDb
    .collection(ROUNDS_COLLECTION)
    .where("status", "==", "active")
    .limit(1)
    .get();

  if (snap.empty) return null;
  return snap.docs[0].data() as Round;
}

export async function createRound(input: CreateRoundInput): Promise<Round> {
  const ref = adminDb.collection(ROUNDS_COLLECTION).doc();
  const now = new Date().toISOString();

  const round: Round = {
    id: ref.id,
    roundNumber: input.roundNumber,
    name: input.name,
    description: input.description ?? "",
    status: "upcoming",
    startTime: input.startTime ?? null,
    endTime: input.endTime ?? null,
    createdAt: now,
    updatedAt: now,
  };

  await ref.set(round);
  return round;
}

/**
 * Updates a round. If status is being set to "active", every other round
 * is atomically flipped out of "active" first — only one round can be live
 * at a time, per the event format.
 */
export async function updateRound(input: UpdateRoundInput): Promise<Round> {
  const ref = adminDb.collection(ROUNDS_COLLECTION).doc(input.id);
  const now = new Date().toISOString();

  await adminDb.runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    if (!doc.exists) throw new Error("Round not found");

    if (input.status === "active") {
      const othersSnap = await tx.get(
        adminDb
          .collection(ROUNDS_COLLECTION)
          .where("status", "==", "active")
      );
      othersSnap.docs
        .filter((d) => d.id !== input.id)
        .forEach((d) => {
          tx.update(d.ref, { status: "completed", updatedAt: now });
        });
    }

    const updates: Record<string, unknown> = { updatedAt: now };
    if (input.name !== undefined) updates.name = input.name;
    if (input.description !== undefined) updates.description = input.description;
    if (input.status !== undefined) updates.status = input.status;
    if (input.startTime !== undefined) updates.startTime = input.startTime;
    if (input.endTime !== undefined) updates.endTime = input.endTime;

    tx.update(ref, updates);
  });

  const updated = await ref.get();
  return updated.data() as Round;
}

export async function deleteRound(id: string): Promise<void> {
  await adminDb.collection(ROUNDS_COLLECTION).doc(id).delete();
  // Note: this does not delete historical roundScores entries on teams,
  // so past points assigned during this round are preserved.
}
