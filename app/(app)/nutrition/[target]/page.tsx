"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import StickyHeader from "@/components/StickyHeader";
import { NUTRITION_LABELS } from "@/components/NutritionCard";
import { computeNutrition } from "@/lib/nutrition";
import type { NutritionPlan } from "@/lib/nutrition";
import { cacheNutrition, getCachedNutrition } from "@/lib/cache";
import { getActiveProgramAnswers } from "@/lib/actions/programs";
import type { Answers } from "@/lib/types";

const DETAILS: Record<keyof NutritionPlan, { goal: string; tips: string }> = {
  maintenance: {
    goal: "Your calories stay where you are — body weight holds steady while training volume and protein keep driving progress.",
    tips: "Weight trending up for 2+ weeks? That is a bulk, pull back to a cut. Trending down? You are cutting, add food back.",
  },
  moderateCut: {
    goal: "Slow fat loss you can actually sustain. Protein stays high so the weight you lose is fat, not muscle.",
    tips: "Expect ~0.3–0.5% of body weight per week. If the scale stalls for 2 weeks, shave ~100 kcal or add 1k steps a day.",
  },
  aggressiveCut: {
    goal: "Fast fat loss for a deadline. The deeper deficit drops weight quickly but costs training energy and can feel hungry.",
    tips: "Best run for short stretches (a few weeks), then ease back toward maintenance. Protein is non-negotiable here.",
  },
  leanBulk: {
    goal: "A small surplus so muscle is built and fat gain stays minimal.",
    tips: "If you gain more than ~0.5% body weight a week, the surplus is too big — pull calories back. Gains in the gym, not the scale.",
  },
};

export default function NutritionTargetPage({ params }: { params: Promise<{ target: string }> }) {
  const [answers, setAnswers] = useState<Answers | null>(() => getCachedNutrition());
  const [target, setTarget] = useState<keyof NutritionPlan | null>(null);

  useEffect(() => {
    params.then(({ target }) => setTarget(target as keyof NutritionPlan));
  }, [params]);

  useEffect(() => {
    getActiveProgramAnswers().then((a) => {
      if (a) {
        setAnswers(a);
        cacheNutrition(a);
      }
    });
  }, []);

  if (!target) return null;
  if (!(target in NUTRITION_LABELS)) notFound();
  if (!answers) {
    return (
      <div className="space-y-4">
        <StickyHeader>
          <Link href="/nutrition" className="text-sm font-medium text-zinc-400 hover:text-zinc-100">
            ← Nutrition
          </Link>
        </StickyHeader>
        <p className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-400">
          Build a program first — your targets come from your profile answers.
        </p>
      </div>
    );
  }

  const plan = computeNutrition(answers);
  const t = plan[target];
  const label = NUTRITION_LABELS[target];
  const detail = DETAILS[target];
  const kg = Number(answers.weightKg) || 70;

  return (
    <div className="space-y-4">
      <StickyHeader>
        <Link href="/nutrition" className="text-sm font-medium text-zinc-400 hover:text-zinc-100">
          ← Nutrition
        </Link>
      </StickyHeader>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <p className="text-xs text-zinc-500">{label.desc}</p>
        <h1 className="text-2xl font-bold text-zinc-100">{label.name}</h1>
        <p className="mt-4 text-4xl font-bold tabular-nums text-zinc-100">{t.calories} kcal</p>
        <p className="mt-1 text-sm tabular-nums text-zinc-400">
          P {t.proteinG}g · C {t.carbsG}g · F {t.fatG}g
        </p>
        <p className="mt-2 text-xs tabular-nums text-zinc-500">
          {t.proteinG * 4} kcal protein · {t.carbsG * 4} kcal carbs · {t.fatG * 9} kcal fat
        </p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 text-sm">
        <p className="mb-1 font-semibold text-zinc-100">What this means</p>
        <p className="text-zinc-400">{detail.goal}</p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 text-sm">
        <p className="mb-1 font-semibold text-zinc-100">Per kg of body weight</p>
        <p className="tabular-nums text-zinc-400">
          P {(t.proteinG / kg).toFixed(1)} g/kg · C {(t.carbsG / kg).toFixed(1)} g/kg · F {(t.fatG / kg).toFixed(1)} g/kg
        </p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 text-sm">
        <p className="mb-1 font-semibold text-zinc-100">Making it work</p>
        <p className="text-zinc-400">{detail.tips}</p>
      </div>
    </div>
  );
}