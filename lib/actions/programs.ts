"use server";

import { revalidatePath } from "next/cache";
import { buildProgram } from "@/lib/engine";
import { createClient, getUser } from "@/lib/supabase/server";
import type { Answers } from "@/lib/types";

export interface SaveResult {
  ok: boolean;
  id?: string;
  error?: string;
}

function parseReps(label: string): [number | null, number | null] {
  const m = label.match(/^(\d+)-(\d+)$/);
  return m ? [Number(m[1]), Number(m[2])] : [null, null];
}

function parseRest(rest: string): number {
  const num = parseFloat(rest) || 90;
  if (rest.includes("s")) return Math.round(num);
  return Math.round(num * 60);
}

export async function saveProgram(
  name: string,
  answers: Answers,
  rationale: string
): Promise<SaveResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const supabase = await createClient();
  const program = buildProgram(answers);

  const { count } = await supabase
    .from("programs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { data, error } = await supabase
    .from("programs")
    .insert({
      user_id: user.id,
      name: name || "My Program",
      answers,
      split_label: program.title,
      rationale: rationale || program.rationale,
      is_active: (count ?? 0) === 0,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };

  const templateRows = program.workouts.map((w, i) => ({
    program_id: data.id,
    day_name: program.weeklySchedule[i]?.day ?? null,
    focus: w.focus,
    position: i,
    duration_min: w.durationMin,
  }));

  const { data: wtData, error: wtErr } = await supabase
    .from("workout_templates")
    .insert(templateRows)
    .select("id");

  if (!wtErr && wtData) {
    const exRows = wtData.flatMap((wt, wi) =>
      program.workouts[wi].exercises.map((e, ei) => {
        const [repsMin, repsMax] = parseReps(e.reps);
        return {
          workout_template_id: wt.id,
          exercise_id: e.id,
          name: e.name,
          position: ei,
          sets: e.sets,
          reps_min: repsMin,
          reps_max: repsMax,
          reps_label: repsMin === null ? e.reps : null,
          rir: e.rir,
          rest_sec: parseRest(e.rest),
          notes: e.notes ?? null,
        };
      })
    );
    await supabase.from("exercise_templates").insert(exRows);
  }

  revalidatePath("/programs");
  revalidatePath("/dashboard");
  return { ok: true, id: data.id };
}

export async function setActiveProgram(id: string) {
  const user = await getUser();
  if (!user) return;
  const supabase = await createClient();

  await supabase.from("programs").update({ is_active: false }).eq("user_id", user.id);
  await supabase.from("programs").update({ is_active: true }).eq("id", id).eq("user_id", user.id);

  revalidatePath("/programs");
  revalidatePath("/dashboard");
}

export async function deleteProgram(id: string) {
  const user = await getUser();
  if (!user) return;
  const supabase = await createClient();

  await supabase.from("programs").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/programs");
  revalidatePath("/dashboard");
}