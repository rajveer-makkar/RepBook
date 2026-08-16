import Link from "next/link";
import { cn } from "@/lib/cn";
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

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthStart = new Date(year, month, 1).toISOString();
  const monthEnd = new Date(year, month + 1, 1).toISOString();
  const { data: monthSessions } = await supabase
    .from("sessions")
    .select("started_at")
    .eq("user_id", user!.id)
    .eq("status", "completed")
    .gte("started_at", monthStart)
    .lt("started_at", monthEnd);

  const workoutDays = new Set(
    (monthSessions ?? []).map(
      (s) => new Date(s.started_at).toLocaleDateString("en-US")
    )
  );
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = now.toLocaleDateString("en-US");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-zinc-100">History</h1>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
        <p className="mb-3 text-sm font-semibold text-zinc-100">
          {now.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
        </p>
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-zinc-500">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
            <span key={d} className="pb-1">{d}</span>
          ))}
          {Array.from({ length: firstWeekday }).map((_, i) => (
            <span key={`blank-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const key = new Date(year, month, day).toLocaleDateString("en-US");
            const trained = workoutDays.has(key);
            const isToday = key === todayKey;
            return (
              <div
                key={key}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-lg text-sm",
                  trained
                    ? "bg-zinc-100 text-zinc-900 font-semibold"
                    : "text-zinc-300",
                  isToday && !trained && "border border-zinc-500"
                )}
              >
                {day}
              </div>
            );
          })}
        </div>
      </section>

      {!sessions || sessions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900 p-8 text-center">
          <p className="text-sm text-zinc-400">
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
                className="block rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition hover:border-zinc-500"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-zinc-100">{focus}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      s.status === "completed"
                        ? "bg-zinc-100 text-zinc-900"
                        : "bg-amber-500/20 text-amber-400"
                    }`}
                  >
                    {s.status}
                  </span>
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
  );
}