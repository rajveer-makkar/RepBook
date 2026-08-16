"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { buildProgram } from "@/lib/engine";
import { createClient, getUser } from "@/lib/supabase/server";
import type { Answers } from "@/lib/types";

export interface SetLogInput {
  exercise_template_id: string | null;
  exercise_name: string;
  set_number: number;
  weight_kg: number | null;
  reps: number | null;
  rir_felt: number | null;
  is_completed: boolean;
}

function weekdayName(): string {
  return new Date().toLocaleDateString("en-US", { weekday: "long" });
}

export async function startTodaySession() {
  const user = await getUser();
  if (!user) redirect("/login");
  const supabase = await createClient();

  const { data: program } = await supabase
    .from("programs")
    .select("id, answers")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();
  if (!program) redirect("/programs");

  const today = weekdayName();
  const generated = buildProgram(program.answers as Answers);
  const idx = generated.weeklySchedule.findIndex((s) => s.day === today);
  if (idx === -1) redirect("/dashboard");

  const { data: existing } = await supabase
    .from("sessions")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "in_progress")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (existing) redirect(`/workout/${existing.id}`);

  const { data: template } = await supabase
    .from("workout_templates")
    .select("id")
    .eq("program_id", program.id)
    .eq("position", idx)
    .single();

  const { data: session, error } = await supabase
    .from("sessions")
    .insert({
      user_id: user.id,
      program_id: program.id,
      workout_template_id: template?.id ?? null,
    })
    .select("id")
    .single();

  redirect(error ? "/dashboard" : `/workout/${session.id}`);
}

export async function completeSession(sessionId: string, logs: SetLogInput[]) {
  const user = await getUser();
  if (!user) return { error: "Not signed in." };
  const supabase = await createClient();

  if (logs.length > 0) {
    const { error } = await supabase.from("set_logs").insert(
      logs.map((l) => ({ ...l, session_id: sessionId }))
    );
    if (error) return { error: error.message };
  }

  const { error } = await supabase
    .from("sessions")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", sessionId)
    .eq("user_id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/history");
  redirect(`/history/${sessionId}`);
}

export async function deleteSession(sessionId: string) {
  const user = await getUser();
  if (!user) redirect("/login");
  const supabase = await createClient();

  await supabase
    .from("sessions")
    .delete()
    .eq("id", sessionId)
    .eq("user_id", user.id);

  revalidatePath("/dashboard");
  revalidatePath("/history");
}