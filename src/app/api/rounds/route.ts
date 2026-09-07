import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "../../../lib/auth/requireUser";
import { requireAdmin } from "../../../lib/auth/requireAdmin";
import {
  createRound,
  deleteRound,
  listRounds,
  updateRound,
} from "../../../lib/firestore/rounds";
import type { CreateRoundInput, UpdateRoundInput } from "../../../types/round";

export async function GET() {
  try {
    await requireUser();
    const rounds = await listRounds();
    return NextResponse.json({ rounds });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = (await req.json()) as CreateRoundInput;

    if (!body.name || typeof body.roundNumber !== "number") {
      return NextResponse.json(
        { error: "name and roundNumber are required" },
        { status: 400 }
      );
    }

    const round = await createRound(body);
    return NextResponse.json({ round }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();
    const body = (await req.json()) as UpdateRoundInput;

    if (!body.id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const round = await updateRound(body);
    return NextResponse.json({ round });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id query param is required" }, { status: 400 });
    }

    await deleteRound(id);
    return NextResponse.json({ success: true });
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
