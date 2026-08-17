"use client";

import { useState } from "react";
import type { NutritionPlan } from "@/lib/nutrition";

export default function NutritionCopy({ plan }: { plan: NutritionPlan }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const text = Object.entries({
      Maintenance: plan.maintenance,
      "Moderate cut": plan.moderateCut,
      "Aggressive cut": plan.aggressiveCut,
      "Lean bulk": plan.leanBulk,
    })
      .map(([name, t]) => `${name}: ${t.calories} kcal · P ${t.proteinG}g / C ${t.carbsG}g / F ${t.fatG}g`)
      .join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      className="w-full rounded-lg border border-zinc-700 px-4 py-3 text-sm font-semibold text-zinc-300 transition active:scale-[0.98] hover:border-zinc-500 hover:text-zinc-100"
    >
      {copied ? "Copied!" : "Copy targets"}
    </button>
  );
}