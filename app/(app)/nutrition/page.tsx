"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import StickyHeader from "@/components/StickyHeader";
import NutritionCard from "@/components/NutritionCard";
import NutritionCopy from "@/components/NutritionCopy";
import { computeNutrition } from "@/lib/nutrition";
import { cacheNutrition, getCachedNutrition } from "@/lib/cache";
import { getActiveProgramAnswers } from "@/lib/actions/programs";
import type { Answers } from "@/lib/types";

export default function NutritionPage() {
  const [answers, setAnswers] = useState<Answers | null>(() => getCachedNutrition());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getActiveProgramAnswers().then((a) => {
      setLoaded(true);
      if (a) {
        setAnswers(a);
        cacheNutrition(a);
      } else if (!getCachedNutrition()) {
        setAnswers(null);
      }
    });
  }, []);

  if (!answers) {
    return (
      <div className="space-y-4">
        <StickyHeader>
          <h1 className="text-2xl font-bold text-zinc-100">Nutrition</h1>
        </StickyHeader>
        <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900 p-8 text-center">
          <p className="text-sm text-zinc-400">
            Build a program first — your targets come from your profile answers.
          </p>
          <Link href="/programs/new" className="mt-2 inline-block text-sm font-medium text-zinc-100 underline">
            Build my program
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <StickyHeader>
        <h1 className="text-2xl font-bold text-zinc-100">Nutrition</h1>
      </StickyHeader>
      <NutritionCard answers={answers} />
      <NutritionCopy plan={computeNutrition(answers)} />
      <p className="text-xs text-zinc-500">
        {loaded ? "Targets are based on your saved profile answers." : "Showing cached targets — offline."}
        {" Update your program to recalculate."}
      </p>
    </div>
  );
}