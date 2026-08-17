import type { Answers } from "@/lib/types";

const KEY = "repbook-cache:nutrition";

export function cacheNutrition(answers: Answers): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(answers));
  } catch {
    /* storage full */
  }
}

export function getCachedNutrition(): Answers | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Answers) : null;
  } catch {
    return null;
  }
}