"use client";

import { useState } from "react";
import Results from "@/components/Results";
import { buildProgram } from "@/lib/engine";
import { updateProgramSwaps } from "@/lib/actions/programs";
import type { Answers, ExerciseSwap, Program } from "@/lib/types";

interface Props {
  programId: string;
  program: Program;
  answers: Answers;
}

export default function ProgramSwapper({ programId, program, answers }: Props) {
  const [prog, setProg] = useState<Program>(program);
  const [saving, setSaving] = useState(false);

  const handleSwap = async (swap: ExerciseSwap) => {
    if (saving) return;
    setSaving(true);
    const next: Answers = { ...answers, swaps: [...(answers.swaps ?? []), swap] };
    setProg(buildProgram(next));
    await updateProgramSwaps(programId, next.swaps ?? []);
    setSaving(false);
  };

  return <Results program={prog} answers={answers} onSwap={handleSwap} />;
}