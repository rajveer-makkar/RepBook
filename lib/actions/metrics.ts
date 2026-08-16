"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, getUser } from "@/lib/supabase/server";

const KG_PER_LB = 0.45359237;

export async function saveMetric(unit: string, formData: FormData) {
  const user = await getUser();
  if (!user) redirect("/login");
  const supabase = await createClient();

  const rawWeight = formData.get("weight");
  if (!rawWeight || isNaN(Number(rawWeight))) return;

  let weightKg = Number(rawWeight);
  if (unit === "lb") weightKg = weightKg * KG_PER_LB;

  const date = String(formData.get("date") || new Date().toISOString().slice(0, 10));
  const waist = formData.get("waist") ? Number(formData.get("waist")) : null;
  const bodyFat = formData.get("bodyFat") ? Number(formData.get("bodyFat")) : null;

  const { data: existing } = await supabase
    .from("body_metrics")
    .select("id")
    .eq("user_id", user.id)
    .eq("date", date)
    .maybeSingle();

  const row = {
    user_id: user.id,
    date,
    weight_kg: Math.round(weightKg * 10) / 10,
    waist_cm: waist && !isNaN(waist) ? waist : null,
    body_fat_pct: bodyFat && !isNaN(bodyFat) ? bodyFat : null,
  };

  if (existing) {
    await supabase.from("body_metrics").update(row).eq("id", existing.id);
  } else {
    await supabase.from("body_metrics").insert(row);
  }

  revalidatePath("/settings");
}

export async function deleteMetric(metricId: string) {
  const user = await getUser();
  if (!user) redirect("/login");
  const supabase = await createClient();

  await supabase.from("body_metrics").delete().eq("id", metricId).eq("user_id", user.id);

  revalidatePath("/settings");
}