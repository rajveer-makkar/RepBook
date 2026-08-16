import { createClient, getUser } from "@/lib/supabase/server";

export default async function HistoryPage() {
  const user = await getUser();
  const supabase = await createClient();

  const { data: sessions } = await supabase
    .from("sessions")
    .select("id, started_at, status")
    .eq("user_id", user!.id)
    .order("started_at", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-zinc-900">History</h1>
      {!sessions || sessions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center">
          <p className="text-sm text-zinc-500">
            No sessions yet. Log your first workout once you have an active program.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <div key={s.id} className="rounded-xl border border-zinc-200 bg-white p-4">
              <p className="text-sm font-medium text-zinc-900">
                {new Date(s.started_at).toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </p>
              <p className="text-xs text-zinc-500">{s.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}