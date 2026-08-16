import Link from "next/link";
import { createClient, getUser } from "@/lib/supabase/server";

export default async function HistoryPage() {
  const user = await getUser();
  const supabase = await createClient();

  const { data: sessions } = await supabase
    .from("sessions")
    .select(
      "id, started_at, status, workout_templates(focus), set_logs(weight_kg, reps)"
    )
    .eq("user_id", user!.id)
    .order("started_at", { ascending: false })
    .limit(30);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-zinc-900">History</h1>
      {!sessions || sessions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center">
          <p className="text-sm text-zinc-500">
            No sessions yet. Start today&apos;s workout from the home screen.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => {
            const logs = s.set_logs ?? [];
            const sets = logs.length;
            const volume = logs.reduce((sum, l) => sum + (l.weight_kg ?? 0) * (l.reps ?? 0), 0);
            const focus = (s.workout_templates as { focus?: string } | null)?.focus ?? "Workout";
            return (
              <Link
                key={s.id}
                href={`/history/${s.id}`}
                className="block rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-400"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-zinc-900">{focus}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      s.status === "completed"
                        ? "bg-zinc-900 text-white"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {s.status}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-zinc-500">
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
  );
}