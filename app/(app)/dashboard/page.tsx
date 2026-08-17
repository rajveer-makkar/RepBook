import Link from "next/link";
import StickyHeader from "@/components/StickyHeader";
import { buildProgram } from "@/lib/engine";
import { fetchFeedbackSummary } from "@/lib/adaptive";
import { startTodaySession } from "@/lib/actions/sessions";
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

  const { data: recentSessions } = await supabase
    .from("sessions")
    .select("id, started_at, status, workout_templates(focus), set_logs(weight_kg, reps)")
    .eq("user_id", user!.id)
    .order("started_at", { ascending: false })
    .limit(5);

  const { data: inProgress } = await supabase
    .from("sessions")
    .select("id, started_at")
    .eq("user_id", user!.id)
    .eq("status", "in_progress")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: activeProgram } = await supabase
    .from("programs")
    .select("id, name, answers, split_label")
    .eq("user_id", user!.id)
    .eq("is_active", true)
    .single();

  const completed = sessions?.length ?? 0;
  const name = profile?.display_name || "there";
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const feedback = await fetchFeedbackSummary(supabase, user!.id);
  const active = activeProgram
    ? { ...buildProgram(activeProgram.answers as Parameters<typeof buildProgram>[0], feedback ?? undefined), id: activeProgram.id, name: activeProgram.name }
    : null;
  const todayIdx = active?.weeklySchedule.findIndex((s) => s.day === today) ?? -1;
  const todayWorkout = todayIdx >= 0 ? active?.weeklySchedule[todayIdx] : null;
  const nextWorkout = active?.weeklySchedule.find((s) => !todayWorkout || s.day !== today) ?? null;

  return (
    <div className="space-y-6">
      <StickyHeader>
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Hey {name}</h1>
          <p className="text-sm text-zinc-400">
            {completed === 0
              ? "Let's get your program set up."
              : `You've completed ${completed} session${completed === 1 ? "" : "s"} so far.`}
          </p>
        </div>
      </StickyHeader>

      {feedback && (feedback.avgDifficulty >= 2 || feedback.pain.size > 0 || feedback.brutalStreak >= 2) && (
        <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-4 text-sm text-sky-300">
          Adjusted for your last {feedback.count} session{feedback.count === 1 ? "" : "s"} —{" "}
          {feedback.avgDifficulty >= 2 ? "volume trimmed and RIR raised to help you recover. " : ""}
          {feedback.brutalStreak >= 2 ? "Your deload was pulled earlier. " : ""}
          {feedback.pain.size > 0 ? "Pain-sensitive exercises were swapped out. " : ""}
          <Link href="/history" className="font-semibold underline">
            See history
          </Link>
        </div>
      )}

      {inProgress ? (
        <Link
          href={`/workout/${inProgress.id}`}
          className="block rounded-xl border border-zinc-700 bg-zinc-800 p-5 shadow-sm transition active:scale-[0.99]"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">In progress</p>
          <h2 className="mt-1 text-lg font-semibold text-zinc-100">Resume your workout</h2>
          <p className="mt-1 text-sm text-zinc-400">Started {new Date(inProgress.started_at).toLocaleTimeString()}</p>
        </Link>
      ) : active && todayWorkout ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            {today} · {active.name}
          </p>
          <h2 className="mt-1 text-lg font-semibold text-zinc-100">{todayWorkout.focus}</h2>
          <p className="mb-3 text-sm text-zinc-400">~{todayWorkout.durationMin} min</p>
          <form action={startTodaySession}>
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-lg bg-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-900 transition active:scale-[0.98] hover:bg-zinc-200"
            >
              Start today&apos;s workout
            </button>
          </form>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <h2 className="mb-1 text-base font-semibold text-zinc-100">
            {active ? `Rest day — next: ${nextWorkout?.focus ?? "see program"}` : "Your program"}
          </h2>
          <p className="mb-4 text-sm text-zinc-400">
            {active
              ? "Log today's weight, meals, or just recover."
              : "Answer a short questionnaire and RepBook builds a personalized plan with tracker tables, progression rules, and deload guidance."}
          </p>
          <Link
            href={active ? `/programs/${active.id}` : "/programs/new"}
            className="inline-flex w-full items-center justify-center rounded-lg bg-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-900 transition active:scale-[0.98] hover:bg-zinc-200"
          >
            {active ? "View my program" : "Build my program"}
          </Link>
        </div>
      )}

      {active && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="mb-3 text-base font-semibold text-zinc-100">Weekly schedule</h2>
          <div className="space-y-2">
            {active.weeklySchedule.map((s) => (
              <div
                key={s.day}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                  s.day === today ? "bg-zinc-100 text-zinc-900" : "bg-zinc-800 text-zinc-300"
                }`}
              >
                <span className="font-medium">{s.day}</span>
                <span className={s.day === today ? "text-zinc-600" : "text-zinc-500"}>{s.focus}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Completed</p>
          <p className="mt-1 text-2xl font-bold text-zinc-100">{completed}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Active program</p>
          <p className="mt-1 truncate text-lg font-bold text-zinc-100">{active?.name ?? "—"}</p>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-100">Workout History</h2>
          <Link href="/history" className="text-sm font-medium text-zinc-400 hover:text-zinc-100">
            See all
          </Link>
        </div>
        {!recentSessions || recentSessions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900 p-6 text-center">
            <p className="text-sm text-zinc-400">No workouts yet — finish your first session and it shows up here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentSessions.map((s) => {
              const logs = s.set_logs ?? [];
              const sets = logs.length;
              const volume = logs.reduce((sum, l) => sum + (l.weight_kg ?? 0) * (l.reps ?? 0), 0);
              const focus = (s.workout_templates as { focus?: string } | null)?.focus ?? "Workout";
              return (
                <Link
                  key={s.id}
                  href={`/history/${s.id}`}
                  className="block rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition active:scale-[0.99] hover:border-zinc-500"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-zinc-100">{focus}</p>
                    {s.status === "in_progress" && (
                      <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[11px] font-medium text-amber-400">
                        in progress
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-zinc-400">
                    {new Date(s.started_at).toLocaleDateString(undefined, {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}
                    {s.status === "completed" && ` · ${sets} sets · ${Math.round(volume)}kg volume`}
                  </p>
                </Link>
              );
            })}
            </div>
          )}
        </div>
    </div>
  );
}