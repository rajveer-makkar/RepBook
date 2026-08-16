import { createClient, getUser } from "@/lib/supabase/server";
import StickyHeader from "@/components/StickyHeader";
import { ProfileForm, SettingsForm } from "@/components/SettingsForms";
import { saveMetric, deleteMetric } from "@/lib/actions/metrics";
import { signOut } from "@/lib/actions/auth";

const today = new Date().toISOString().slice(0, 10);

export default async function SettingsPage() {
  const user = await getUser();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, sex, height_cm, age, sleep_hours, activity")
    .eq("id", user!.id)
    .single();

  const { data: settings } = await supabase
    .from("user_settings")
    .select("unit")
    .eq("user_id", user!.id)
    .single();

  const unit = settings?.unit ?? "kg";

  const { data: metrics } = await supabase
    .from("body_metrics")
    .select("id, date, weight_kg, waist_cm, body_fat_pct")
    .eq("user_id", user!.id)
    .order("date", { ascending: false })
    .limit(10);

  const inputCls =
    "w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500";

  return (
    <div className="space-y-6">
      <StickyHeader>
        <h1 className="text-2xl font-bold text-zinc-100">Settings</h1>
      </StickyHeader>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="mb-4 text-base font-semibold text-zinc-100">Profile</h2>
        <ProfileForm profile={profile ?? {}} />
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="mb-4 text-base font-semibold text-zinc-100">Units</h2>
        <SettingsForm unit={unit} />
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="mb-4 text-base font-semibold text-zinc-100">Body metrics</h2>
        <form action={saveMetric.bind(null, unit)} className="mb-4 grid grid-cols-2 gap-2">
          <input type="number" name="weight" step="0.5" required placeholder={`Weight (${unit})`} className={inputCls} />
          <input type="number" name="waist" step="0.5" placeholder="Waist (cm)" className={inputCls} />
          <input type="number" name="bodyFat" step="0.1" min="0" max="60" placeholder="Body fat %" className={inputCls} />
          <input type="date" name="date" defaultValue={today} className={inputCls} />
          <button
            type="submit"
            className="col-span-2 rounded-lg bg-zinc-100 px-4 py-2.5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-200"
          >
            Log today
          </button>
        </form>
        {!metrics || metrics.length === 0 ? (
          <p className="text-sm text-zinc-400">No entries yet. Weigh in on the same time of day for consistent trends.</p>
        ) : (
          <div className="space-y-2">
            {metrics.map((m) => {
              const kg = Number(m.weight_kg);
              const w = unit === "lb" ? Math.round(kg * 2.20462 * 2) / 2 : kg;
              return (
                <div key={m.id} className="flex items-center justify-between rounded-lg bg-zinc-800 px-3 py-2 text-sm">
                  <div>
                    <span className="font-semibold text-zinc-100">
                      {w} {unit}
                    </span>
                    {m.waist_cm && <span className="ml-2 text-zinc-400">waist {m.waist_cm} cm</span>}
                    {m.body_fat_pct != null && <span className="ml-2 text-zinc-400">BF {m.body_fat_pct}%</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">
                      {new Date(m.date + "T12:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                    <form action={deleteMetric.bind(null, m.id)}>
                      <button type="submit" className="text-xs font-semibold text-zinc-500 hover:text-red-400">
                        ✕
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="mb-4 text-base font-semibold text-zinc-100">Account</h2>
        <p className="mb-3 text-sm text-zinc-400">
          Signed in as {user?.email}
        </p>
        <form action={signOut}>
          <button
            type="submit"
            className="w-full rounded-lg border border-red-500/30 px-4 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/10"
          >
            Sign out
          </button>
        </form>
      </section>
    </div>
  );
}