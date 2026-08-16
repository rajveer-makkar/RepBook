import Link from "next/link";
import { notFound } from "next/navigation";
import WorkoutLogger from "@/components/Logging/WorkoutLogger";
import { suggestForWorkout } from "@/lib/progression";
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

  const suggestions: Record<string, ReturnType<typeof suggestForWorkout>[string]> = {};
  if (template && exercises && exercises.length > 0) {
    const { data: lastSession } = await supabase
      .from("sessions")
      .select("id")
      .eq("user_id", user!.id)
      .eq("status", "completed")
      .eq("workout_template_id", template.id)
      .neq("id", sessionId)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastSession) {
      const { data: lastLogs } = await supabase
        .from("set_logs")
        .select("exercise_template_id, weight_kg, reps, rir_felt")
        .eq("session_id", lastSession.id)
        .order("set_number", { ascending: true });
      if (lastLogs) {
        const byExercise = lastLogs.reduce<Record<string, typeof lastLogs>>((acc, l) => {
          if (l.exercise_template_id) (acc[l.exercise_template_id] ??= []).push(l);
          return acc;
        }, {});
        Object.assign(
          suggestions,
          suggestForWorkout(
            exercises.map((e) => ({ id: e.id, name: e.name, repsMin: e.reps_min, repsMax: e.reps_max })),
            byExercise
          )
        );
      }
    }
  }

  return (
    <div className="space-y-4">
      <Link href="/dashboard" className="text-sm font-medium text-zinc-400 hover:text-zinc-100">
        ← Home
      </Link>
      {session.status === "completed" ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-center">
          <p className="text-sm text-zinc-400">This workout is already completed.</p>
          <Link href={`/history/${sessionId}`} className="mt-2 inline-block text-sm font-medium text-zinc-100 underline">
            View session
          </Link>
        </div>
      ) : (
        <WorkoutLogger
          sessionId={sessionId}
          focus={template?.focus ?? "Workout"}
          suggestions={suggestions}
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