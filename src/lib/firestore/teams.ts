import { adminDb } from "../../lib/firebase/admin";
import type { Team } from "../../types/team";
import type { RoundScoreEntry } from "../../types/leaderboard";

const TEAMS_COLLECTION = "teams";
const ROUND_SCORES_SUBCOLLECTION = "roundScores";

export async function listTeams(): Promise<Team[]> {
  const snap = await adminDb.collection(TEAMS_COLLECTION).get();
  return snap.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Team),
  }));
}

export async function getTeam(teamId: string): Promise<Team | null> {
  const doc = await adminDb.collection(TEAMS_COLLECTION).doc(teamId).get();
  if (!doc.exists) return null;
  return {
    id: doc.id,
    ...(doc.data() as Team),
  };
}

export async function adjustTeamPoints(params: {
  teamId: string;
  roundId: string;
  points: number;
  note?: string;
  adminUid: string;
}): Promise<Team> {
  const { teamId, roundId, points, note, adminUid } = params;
  const teamRef = adminDb.collection(TEAMS_COLLECTION).doc(teamId);
  const scoreRef = teamRef.collection(ROUND_SCORES_SUBCOLLECTION).doc(roundId);
  const now = new Date().toISOString();

  await adminDb.runTransaction(async (tx) => {
    const teamDoc = await tx.get(teamRef);
    if (!teamDoc.exists) throw new Error("Team not found");

    const scoreDoc = await tx.get(scoreRef);
    const previousRoundPoints = scoreDoc.exists
      ? (scoreDoc.data() as RoundScoreEntry).points
      : 0;

    const entry: RoundScoreEntry = {
      roundId,
      points: previousRoundPoints + points,
      note,
      updatedAt: now,
      updatedBy: adminUid,
    };

    tx.set(scoreRef, entry, { merge: true });

    const currentTotal = (teamDoc.data() as Team).totalPoints ?? 0;
    tx.update(teamRef, {
      totalPoints: currentTotal + points,
      updatedAt: now,
    });
  });

  const updated = await teamRef.get();
  return {
    id: updated.id,
    ...(updated.data() as Team),
  };
}

export async function getRoundPointsForTeam(
  teamId: string,
  roundId: string
): Promise<number> {
  const doc = await adminDb
    .collection(TEAMS_COLLECTION)
    .doc(teamId)
    .collection(ROUND_SCORES_SUBCOLLECTION)
    .doc(roundId)
    .get();

  if (!doc.exists) return 0;
  return (doc.data() as RoundScoreEntry).points;
}