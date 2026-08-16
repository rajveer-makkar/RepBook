import Link from "next/link";
import { notFound } from "next/navigation";
import WorkoutLogger from "@/components/Logging/WorkoutLogger";
import { createClient, getUser } from "@/lib/supabase/server";

export default async function WorkoutPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const user = await getUser();
  const supabase = await createClient();

  const { data: session } = await supabase
    .from("sessions")
    .select("id, status, workout_template_id")
    .eq("id", sessionId)
    .eq("user_id", user!.id)
    .single();

  if (!session) notFound();

  const { data: template } = session.workout_template_id
    ? await supabase
        .from("workout_templates")
        .select("id, focus")
        .eq("id", session.workout_template_id)
        .single()
    : { data: null };

  const { data: exercises } = template
    ? await supabase
        .from("exercise_templates")
        .select("id, name, sets, reps_min, reps_max, reps_label, rir, rest_sec, notes")
        .eq("workout_template_id", template.id)
        .order("position", { ascending: true })
    : { data: [] };

  return (
    <div className="space-y-4">
      <Link href="/dashboard" className="text-sm font-medium text-zinc-500 hover:text-zinc-900">
        ← Home
      </Link>
      {session.status === "completed" ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 text-center">
          <p className="text-sm text-zinc-500">This workout is already completed.</p>
          <Link href={`/history/${sessionId}`} className="mt-2 inline-block text-sm font-medium text-zinc-900 underline">
            View session
          </Link>
        </div>
      ) : (
        <WorkoutLogger
          sessionId={sessionId}
          focus={template?.focus ?? "Workout"}
          exercises={(exercises ?? []).map((e) => ({
            id: e.id,
            name: e.name,
            sets: e.sets,
            reps: e.reps_label ?? (e.reps_min && e.reps_max ? `${e.reps_min}-${e.reps_max}` : "—"),
            rir: e.rir ?? 1,
            restSec: e.rest_sec ?? 90,
            notes: e.notes,
          }))}
        />
      )}
    </div>
  );
}