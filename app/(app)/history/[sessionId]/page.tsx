import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteSession } from "@/lib/actions/sessions";
import { createClient, getUser } from "@/lib/supabase/server";

export default async function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser();
  const supabase = await createClient();

  const { data: session } = await supabase
    .from("sessions")
    .select("id, started_at, completed_at, status, notes, workout_templates(focus)")
    .eq("id", id)
    .eq("user_id", user!.id)
    .single();
  if (!session) notFound();

  const { data: logs } = await supabase
    .from("set_logs")
    .select("id, exercise_name, set_number, weight_kg, reps, rir_felt")
    .eq("session_id", id)
    .order("set_number", { ascending: true });

  const byExercise = (logs ?? []).reduce<Record<string, NonNullable<typeof logs>>>((acc, log) => {
    (acc[log.exercise_name] ??= []).push(log);
    return acc;
  }, {});

  const totalVolume = (logs ?? []).reduce((sum, l) => sum + (l.weight_kg ?? 0) * (l.reps ?? 0), 0);

  return (
    <div className="space-y-4">
      <Link href="/history" className="text-sm font-medium text-zinc-500 hover:text-zinc-900">
        ← History
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">{session.workout_templates?.[0]?.focus ?? "Workout"}</h1>
          <p className="text-sm text-zinc-500">
            {new Date(session.started_at).toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <form action={deleteSession.bind(null, id)}>
          <button
            type="submit"
            className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            Delete
          </button>
        </form>
      </div>

      {session.status === "completed" && (
        <p className="text-sm text-zinc-500">
          {Object.keys(byExercise).length} exercises · {logs?.length ?? 0} sets · {Math.round(totalVolume)}kg total volume
        </p>
      )}

      {session.status !== "completed" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          This session was started but never finished.
        </div>
      )}

      <div className="space-y-3">
        {Object.entries(byExercise).map(([name, sets]) => (
          <div key={name} className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="mb-2 font-semibold text-zinc-900">{name}</p>
            <div className="space-y-1">
              {sets.map((log) => (
                <div key={log.id} className="flex items-center gap-3 text-sm">
                  <span className="w-6 text-xs text-zinc-400">{log.set_number}</span>
                  <span className="font-medium text-zinc-800">{log.weight_kg ?? "—"}kg</span>
                  <span className="text-zinc-500">× {log.reps ?? "—"}</span>
                  {log.rir_felt !== null && (
                    <span className="ml-auto text-xs text-zinc-400">RIR {log.rir_felt}</span>
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