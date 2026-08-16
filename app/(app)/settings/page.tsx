import { createClient, getUser } from "@/lib/supabase/server";
import { ProfileForm, SettingsForm } from "@/components/SettingsForms";
import { signOut } from "@/lib/actions/auth";

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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Settings</h1>

      <section className="rounded-xl border border-zinc-200 bg-white p-5">
        <h2 className="mb-4 text-base font-semibold text-zinc-900">Profile</h2>
        <ProfileForm profile={profile ?? {}} />
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5">
        <h2 className="mb-4 text-base font-semibold text-zinc-900">Units</h2>
        <SettingsForm unit={settings?.unit ?? "kg"} />
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5">
        <h2 className="mb-4 text-base font-semibold text-zinc-900">Account</h2>
        <p className="mb-3 text-sm text-zinc-500">
          Signed in as {user?.email}
        </p>
        <form action={signOut}>
          <button
            type="submit"
            className="w-full rounded-lg border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            Sign out
          </button>
        </form>
      </section>
    </div>
  );
}