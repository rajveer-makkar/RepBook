import { NextResponse } from "next/server";
import { buildProgram } from "@/lib/engine";
import { enhanceProse, hasApiKey } from "@/lib/llm";
import type { Answers } from "@/lib/types";

export async function POST(req: Request) {
  let answers: Answers;
  try {
    const body = await req.json();
    answers = body.answers as Answers;
    if (!answers || typeof answers.daysPerWeek !== "number")
      return NextResponse.json({ ok: false, error: "Invalid answers." }, { status: 400 });
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  if (!hasApiKey())
    return NextResponse.json({ ok: false, error: "No LLM API key configured on the server." });

  const program = buildProgram(answers);
  const result = await enhanceProse(program, answers);
  return NextResponse.json(result);
}