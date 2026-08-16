"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface ProfileResult {
  error?: string;
}

export async function updateProfile(prev: ProfileResult, formData: FormData): Promise<ProfileResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const values = {
    display_name: String(formData.get("display_name") ?? "").trim(),
    sex: String(formData.get("sex") ?? ""),
    height_cm: Number(formData.get("height_cm") || null),
    age: Number(formData.get("age") || null),
    sleep_hours: String(formData.get("sleep_hours") ?? ""),
    activity: String(formData.get("activity") ?? ""),
  };

  const { error } = await supabase
    .from("profiles")
    .update(values)
    .eq("id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return {};
}

export async function updateSettings(prev: ProfileResult, formData: FormData): Promise<ProfileResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const unit = String(formData.get("unit") ?? "kg");

  const { error } = await supabase.from("user_settings").upsert(
    { user_id: user.id, unit: unit === "lb" ? "lb" : "kg" },
    { onConflict: "user_id" }
  );
  if (error) return { error: error.message };

  revalidatePath("/settings");
  return {};
}