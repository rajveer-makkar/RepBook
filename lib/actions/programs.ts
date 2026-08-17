"use server";

import { revalidatePath } from "next/cache";
import { buildProgram } from "@/lib/engine";
import { createClient, getUser } from "@/lib/supabase/server";
import type { Answers, ExerciseSwap } from "@/lib/types";
import type { FeedbackSummary } from "@/lib/adaptive";

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
  rationale: string,
  feedback?: FeedbackSummary
): Promise<SaveResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const supabase = await createClient();
  const program = buildProgram(answers, feedback);

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

export async function getActiveProgramAnswers(): Promise<Answers | null> {
  const user = await getUser();
  if (!user) return null;
  const supabase = await createClient();

  const { data } = await supabase
    .from("programs")
    .select("answers")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  if (!data) {
    const { data: latest } = await supabase
      .from("programs")
      .select("answers")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return latest?.answers as Answers | null;
  }
  return data.answers as Answers;
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

export async function updateProgramSwaps(id: string, swaps: ExerciseSwap[]) {
  const user = await getUser();
  if (!user) return { ok: false, error: "Not signed in." };
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("programs")
    .select("answers")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (!existing) return { ok: false, error: "Program not found." };

  const answers = { ...(existing.answers as Answers), swaps };

  const { error } = await supabase
    .from("programs")
    .update({ answers })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/programs/${id}`);
  revalidatePath("/programs");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteProgram(id: string) {
  const user = await getUser();
  if (!user) return;
  const supabase = await createClient();

  await supabase.from("programs").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/programs");
  revalidatePath("/dashboard");
}

export async function renameProgram(id: string, name: string) {
  const user = await getUser();
  if (!user) return { ok: false, error: "Not signed in." };
  const supabase = await createClient();

  const { error } = await supabase
    .from("programs")
    .update({ name: name.trim() || "My Program" })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/programs/${id}`);
  revalidatePath("/programs");
  return { ok: true };
}

async function replaceTemplates(supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>, programId: string, answers: Answers, feedback?: FeedbackSummary) {
  const program = buildProgram(answers, feedback);
  const title = program.title;

  await supabase.from("exercise_templates").delete().in(
    "workout_template_id",
    (await supabase.from("workout_templates").select("id").eq("program_id", programId)).data?.map((t) => t.id) ?? []
  );
  await supabase.from("workout_templates").delete().eq("program_id", programId);

  const templateRows = program.workouts.map((w, i) => ({
    program_id: programId,
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

  return { ok: true, title };
}

export async function updateProgram(
  id: string,
  name: string,
  answers: Answers,
  rationale: string,
  feedback?: FeedbackSummary
): Promise<SaveResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Not signed in." };
  const supabase = await createClient();

  const res = await replaceTemplates(supabase, id, answers, feedback);
  if (!res.ok) return res;

  const { error } = await supabase
    .from("programs")
    .update({
      name: name.trim() || "My Program",
      answers,
      split_label: res.title,
      rationale: rationale || null,
    })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/programs/${id}`);
  revalidatePath("/programs");
  revalidatePath("/dashboard");
  return { ok: true, id };
}