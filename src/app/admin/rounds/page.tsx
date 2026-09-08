import { redirect } from "next/navigation";
import { requireAdmin, ForbiddenError } from "../../../lib/auth/requireAdmin";
import { UnauthorizedError } from "../../../lib/auth/requireUser";
import { listRounds } from "../../../lib/firestore/rounds";
import { RoundManager } from "../../../components/admin/RoundManager";

export default async function AdminRoundsPage() {
  try {
    await requireAdmin();
  } catch (err) {
    if (err instanceof UnauthorizedError) redirect("/login");
    if (err instanceof ForbiddenError) redirect("/dashboard");
    throw err;
  }

  const rounds = await listRounds();

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 border-b border-white/10 pb-6">
          <p className="font-mono text-xs uppercase tracking-wider text-red-500">
            admin
          </p>
          <h1 className="mt-1 text-3xl font-bold text-[#f0e6d3]">Round Management</h1>
          <p className="mt-2 text-sm text-white/50">
            Only one round can be active at a time — activating a round automatically
            completes whichever one was live before it.
          </p>
        </div>

        <RoundManager initialRounds={rounds} />
      </div>
    </div>
  );
}
