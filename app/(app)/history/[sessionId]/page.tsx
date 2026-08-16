import Link from "next/link";
import { notFound } from "next/navigation";
import StickyHeader from "@/components/StickyHeader";
import { deleteSession } from "@/lib/actions/sessions";
import { createClient, getUser } from "@/lib/supabase/server";

export default async function SessionDetailPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const user = await getUser();
  const supabase = await createClient();

  const { data: session } = await supabase
    .from("sessions")
    .select("id, started_at, completed_at, status, notes, workout_templates(focus)")
    .eq("id", sessionId)
    .eq("user_id", user!.id)
    .single();
  if (!session) notFound();

  const { data: logs } = await supabase
    .from("set_logs")
    .select("id, exercise_name, set_number, weight_kg, reps, rir_felt")
    .eq("session_id", sessionId)
    .order("set_number", { ascending: true });

  const byExercise = (logs ?? []).reduce<Record<string, NonNullable<typeof logs>>>((acc, log) => {
    (acc[log.exercise_name] ??= []).push(log);
    return acc;
  }, {});

  const totalVolume = (logs ?? []).reduce((sum, l) => sum + (l.weight_kg ?? 0) * (l.reps ?? 0), 0);

  const exerciseNames = Object.keys(byExercise);
  const progressionByExercise: Record<string, { date: string; weight: number }[]> = {};
  if (exerciseNames.length > 0) {
    const { data: recent } = await supabase
      .from("sessions")
      .select("id, started_at")
      .eq("user_id", user!.id)
      .eq("status", "completed")
      .order("started_at", { ascending: false })
      .limit(5);
    if (recent && recent.length > 0) {
      const { data: recentLogs } = await supabase
        .from("set_logs")
        .select("session_id, exercise_name, weight_kg")
        .in("exercise_name", exerciseNames)
        .in(
          "session_id",
          recent.map((s) => s.id)
        );
      const dateBySession = new Map(recent.map((s) => [s.id, s.started_at]));
      const topBySession = new Map<string, number>();
      for (const log of recentLogs ?? []) {
        if (!log.weight_kg || !log.exercise_name) continue;
        const key = `${log.session_id}|${log.exercise_name}`;
        topBySession.set(key, Math.max(topBySession.get(key) ?? 0, log.weight_kg));
      }
      for (const [key, weight] of topBySession) {
        const [sessionId, name] = key.split("|");
        const date = new Date(dateBySession.get(sessionId) ?? "").toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        });
        (progressionByExercise[name] ??= []).push({ date, weight });
      }
    }
  }

  return (
    <div className="space-y-4">
      <StickyHeader>
        <Link href="/history" className="text-sm font-medium text-zinc-400 hover:text-zinc-100">
          ← History
        </Link>
      </StickyHeader>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">
            {(session.workout_templates as { focus?: string } | null)?.focus ?? "Workout"}
          </h1>
          <p className="text-sm text-zinc-400">
            {new Date(session.started_at).toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <form action={deleteSession.bind(null, sessionId)}>
          <button
            type="submit"
            className="rounded-lg border border-red-500/30 px-3 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/10"
          >
            Delete
          </button>
        </form>
      </div>

      {session.status === "completed" && (
        <p className="text-sm text-zinc-400">
          {Object.keys(byExercise).length} exercises · {logs?.length ?? 0} sets · {Math.round(totalVolume)}kg total volume
        </p>
      )}

      {session.status !== "completed" && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-300">
          This session was started but never finished.
        </div>
      )}

      <div className="space-y-3">
        {Object.entries(byExercise).map(([name, sets]) => (
          <div key={name} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <p className="mb-2 font-semibold text-zinc-100">{name}</p>
            {(progressionByExercise[name] ?? []).length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {progressionByExercise[name].map((p) => (
                  <span
                    key={p.date + p.weight}
                    className="rounded-md bg-zinc-800 px-2 py-1 text-[11px] font-medium text-zinc-400"
                  >
                    {p.date} · {p.weight}kg
                  </span>
                ))}
              </div>
            )}
            <div className="space-y-1">
              {sets.map((log) => (
                <div key={log.id} className="flex items-center gap-3 text-sm">
                  <span className="w-6 text-xs text-zinc-500">{log.set_number}</span>
                  <span className="font-medium text-zinc-200">{log.weight_kg ?? "—"}kg</span>
                  <span className="text-zinc-400">× {log.reps ?? "—"}</span>
                  {log.rir_felt !== null && (
                    <span className="ml-auto text-xs text-zinc-500">RIR {log.rir_felt}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}