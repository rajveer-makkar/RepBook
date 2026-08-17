import type { Answers } from "@/lib/types";

export interface NutritionPlan {
  maintenance: NutritionTarget;
  moderateCut: NutritionTarget;
  aggressiveCut: NutritionTarget;
  leanBulk: NutritionTarget;
}

export interface NutritionTarget {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

const stepsFactor = (dailySteps: string): number => {
  if (/9-10k|10k\+/.test(dailySteps)) return 1.35;
  if (/7-8k|6-7k/.test(dailySteps)) return 1.25;
  return 1.15;
};

function bmr(a: Answers): number {
  const kg = Number(a.weightKg) || 70;
  const cm = Number(a.heightCm) || 170;
  const age = Number(a.age) || 30;
  const base = 10 * kg + 6.25 * cm - 5 * age;
  return a.sex === "female" ? base - 161 : base + 5;
}

function tdee(a: Answers): number {
  const training = Math.min(a.daysPerWeek, 6) * 0.045; // +~0.05 MET-hr per training day
  return bmr(a) * (stepsFactor(a.dailySteps) + training);
}

// Goal-aware deflection applied on top of the base TDEE.
function goalFactor(a: Answers): number {
  if (a.goal === "fat-loss") return 1.05;
  if (a.goal === "muscle-gain") return 1.03;
  if (a.dieting) return 1.03;
  return 1;
}

function macros(calories: number, kg: number): NutritionTarget {
  const proteinG = Math.round(2 * kg);
  const fatG = Math.round(Math.max(0.7 * kg, calories * 0.25 / 9));
  const carbsG = Math.max(0, Math.round((calories - proteinG * 4 - fatG * 9) / 4));
  return { calories: Math.round(calories), proteinG, carbsG, fatG };
}

export function computeNutrition(a: Answers): NutritionPlan {
  const base = tdee(a) * goalFactor(a);
  return {
    maintenance: macros(base, Number(a.weightKg) || 70),
    moderateCut: macros(base * 0.85, Number(a.weightKg) || 70),
    aggressiveCut: macros(base * 0.75, Number(a.weightKg) || 70),
    leanBulk: macros(base * 1.1, Number(a.weightKg) || 70),
  };
}

export function preferredTarget(a: Answers): keyof NutritionPlan {
  if (a.goal === "fat-loss") return "moderateCut";
  if (a.goal === "muscle-gain") return "leanBulk";
  return "maintenance";
}