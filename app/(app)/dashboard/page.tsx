import Link from "next/link";
import { createClient, getUser } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const user = await getUser();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user!.id)
    .single();

  const { data: sessions } = await supabase
    .from("sessions")
    .select("id")
    .eq("status", "completed");

  const name = profile?.display_name || "there";
  const completed = sessions?.length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Hey {name}</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {completed === 0
            ? "Let's get your program set up."
            : `You've completed ${completed} session${completed === 1 ? "" : "s"} so far.`}
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="mb-1 text-base font-semibold text-zinc-900">Your program</h2>
        <p className="mb-4 text-sm text-zinc-500">
          Answer a short questionnaire and RepBook builds a personalized plan with tracker
          tables, progression rules, and deload guidance.
        </p>
        <Link
          href="/programs/new"
          className="inline-flex w-full items-center justify-center rounded-lg bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700"
        >
          Build my program
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Completed</p>
          <p className="mt-1 text-2xl font-bold text-zinc-900">{completed}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Streak</p>
          <p className="mt-1 text-2xl font-bold text-zinc-900">—</p>
        </div>
      </div>
    </div>
  );
}