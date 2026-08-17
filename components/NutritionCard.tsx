"use client";

import { computeNutrition, preferredTarget } from "@/lib/nutrition";
import type { NutritionPlan } from "@/lib/nutrition";
import type { Answers } from "@/lib/types";

const LABELS: Record<keyof NutritionPlan, { name: string; desc: string }> = {
  maintenance: { name: "Maintenance", desc: "Stay at current weight" },
  moderateCut: { name: "Moderate cut", desc: "~15% deficit" },
  aggressiveCut: { name: "Aggressive cut", desc: "~25% deficit" },
  leanBulk: { name: "Lean bulk", desc: "~10% surplus" },
};

export default function NutritionCard({ answers }: { answers: Answers }) {
  const plan = computeNutrition(answers);
  const active = preferredTarget(answers);

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <h2 className="mb-1 text-lg font-semibold text-zinc-100">Nutrition targets</h2>
      <p className="mb-4 text-sm text-zinc-400">
        Based on your profile, body stats, and training volume. Recheck after weigh-ins.
      </p>

      <div className="grid grid-cols-2 gap-2">
        {(Object.keys(plan) as (keyof NutritionPlan)[]).map((key) => {
          const t = plan[key];
          const label = LABELS[key];
          const isActive = key === active;
          return (
            <div
              key={key}
              className={`rounded-lg border p-3 ${
                isActive ? "border-zinc-100 bg-zinc-800" : "border-zinc-800 bg-zinc-900"
              }`}
            >
              <div className="flex items-baseline justify-between">
                <p className="text-sm font-semibold text-zinc-100">{label.name}</p>
                {isActive && (
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-900">
                    Your goal
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500">{label.desc}</p>
              <p className="mt-2 text-xl font-bold tabular-nums text-zinc-100">{t.calories} kcal</p>
              <p className="mt-1 text-xs tabular-nums text-zinc-400">
                P {t.proteinG}g · C {t.carbsG}g · F {t.fatG}g
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}