"use client";

import { useState } from "react";
import Results from "@/components/Results";
import { buildProgram } from "@/lib/engine";
import { toSummary } from "@/lib/adaptive";
import { updateProgramSwaps } from "@/lib/actions/programs";
import type { Answers, ExerciseSwap, Program } from "@/lib/types";
import type { FeedbackProp } from "@/lib/adaptive";

interface Props {
  programId: string;
  program: Program;
  answers: Answers;
  feedback?: FeedbackProp | null;
}

export default function ProgramSwapper({ programId, program, answers, feedback }: Props) {
  const [prog, setProg] = useState<Program>(program);
  const [saving, setSaving] = useState(false);
  const summary = feedback ? toSummary(feedback) : undefined;

  const handleSwap = async (swap: ExerciseSwap) => {
    if (saving) return;
    setSaving(true);
    const next: Answers = { ...answers, swaps: [...(answers.swaps ?? []), swap] };
    setProg(buildProgram(next, summary));
    await updateProgramSwaps(programId, next.swaps ?? []);
    setSaving(false);
  };

  return <Results program={prog} answers={answers} onSwap={handleSwap} />;
}