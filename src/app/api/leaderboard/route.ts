import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../../../lib/auth/requireAdmin";
import { getLeaderboard } from "../../../lib/firestore/leaderboard";
import { adjustTeamPoints } from "../../../lib/firestore/teams";
import { getActiveRound } from "../../../lib/firestore/rounds";
import type { AssignPointsInput } from "../../../types/leaderboard";

export const dynamic = 'force-dynamic';

/*
export async function GET() {
  try {
    const leaderboard = (await getLeaderboard()) || [];
    return NextResponse.json({ leaderboard });
  } catch (err) {
    console.error("Firestore Fetch Error:", err);
    // Return empty list on failure instead of 500 server crash
    return NextResponse.json({ leaderboard: [] }, { status: 200 });
  }
}
*/
export async function GET() {
  try {
    const [activeRound, leaderboard] = await Promise.all([
      getActiveRound(),
      getLeaderboard(),
    ]);

    return NextResponse.json({
      activeRoundName: activeRound ? activeRound.name : "No Active Round",
      leaderboard: leaderboard || [],
    });
  } catch (err) {
    console.error("Firestore Fetch Error:", err);
    return NextResponse.json(
      { activeRoundName: "No Active Round", leaderboard: [] },
      { status: 200 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = (await req.json()) as AssignPointsInput;

    if (!body.teamId || typeof body.points !== "number") {
      return NextResponse.json(
        { error: "teamId and points are required" },
        { status: 400 }
      );
    }

    const activeRound = await getActiveRound();
    if (!activeRound) {
      return NextResponse.json(
        { error: "No round is currently active. Activate a round before assigning points." },
        { status: 400 }
      );
    }

    const team = await adjustTeamPoints({
      teamId: body.teamId,
      roundId: activeRound.id,
      points: body.points,
      note: body.note,
      adminUid: admin.uid,
    });

    const leaderboard = await getLeaderboard();
    return NextResponse.json({ team, leaderboard });
  } catch (err) {
    return handleError(err);
  }
}

function handleError(err: unknown) {
  const message = err instanceof Error ? err.message : "Something went wrong";
  const status =
    err instanceof Error && err.name === "UnauthorizedError"
      ? 401
      : err instanceof Error && err.name === "ForbiddenError"
        ? 403
        : 500;
  return NextResponse.json({ error: message }, { status });
}
