import Link from "next/link";
import { buildProgram } from "@/lib/engine";
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
    .eq("user_id", user!.id)
    .eq("status", "completed");

  const { data: activeProgram } = await supabase
    .from("programs")
    .select("id, name, answers, split_label")
    .eq("user_id", user!.id)
    .eq("is_active", true)
    .single();

  const completed = sessions?.length ?? 0;
  const name = profile?.display_name || "there";
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const active = activeProgram
    ? { ...buildProgram(activeProgram.answers as Parameters<typeof buildProgram>[0]), id: activeProgram.id, name: activeProgram.name }
    : null;
  const todayWorkout = active?.weeklySchedule.find((s) => s.day === today);

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

      {active && todayWorkout ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            {today} · {active.name}
          </p>
          <h2 className="mt-1 text-lg font-semibold text-zinc-900">{todayWorkout.focus}</h2>
          <p className="mb-3 text-sm text-zinc-500">~{todayWorkout.durationMin} min</p>
          <Link
            href={`/programs/${active.id}`}
            className="inline-flex w-full items-center justify-center rounded-lg bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700"
          >
            Open today&apos;s workout
          </Link>
        </div>
      ) : (
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
            {active ? "View my program" : "Build my program"}
          </Link>
        </div>
      )}

      {active && (
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="mb-3 text-base font-semibold text-zinc-900">Weekly schedule</h2>
          <div className="space-y-2">
            {active.weeklySchedule.map((s) => (
              <div
                key={s.day}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                  s.day === today ? "bg-zinc-900 text-white" : "bg-zinc-50 text-zinc-700"
                }`}
              >
                <span className="font-medium">{s.day}</span>
                <span className={s.day === today ? "text-zinc-300" : "text-zinc-500"}>{s.focus}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Completed</p>
          <p className="mt-1 text-2xl font-bold text-zinc-900">{completed}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Active program</p>
          <p className="mt-1 truncate text-lg font-bold text-zinc-900">{active?.name ?? "—"}</p>
        </div>
      </div>
    </div>
  );
}