import type { Answers, Program } from "./types";

type Provider = "anthropic" | "openai";

export function hasApiKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY);
}

function provider(): Provider | null {
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (process.env.OPENAI_API_KEY) return "openai";
  return null;
}

export interface EnhanceResult {
  ok: boolean;
  rationale?: string;
  error?: string;
}

export async function enhanceProse(program: Program, answers: Answers): Promise<EnhanceResult> {
  const p = provider();
  if (!p) return { ok: false, error: "No API key configured." };

  const system = `You are an evidence-based strength & hypertrophy coach. You write clear, direct, jargon-free coaching prose. No fluff, no lists of generic advice — say something specific to this athlete and program. Keep the response under 250 words.`;

  const user = `
ATHLETE PROFILE
- Age: ${answers.age}, sex: ${answers.sex}, ${answers.heightCm}cm, ${answers.weightKg}kg${answers.bodyFatPct ? `, ~${answers.bodyFatPct}% body fat` : ""}
- Goal: ${answers.goal}. Priority: ${answers.priority}.
- Experience: ${answers.experienceYears} years consistent lifting${answers.structuredPrograms ? ", has followed structured programs" : ""}.
- Strength: bench ${answers.benchKg ?? "n/a"}kg, pull-ups ${answers.pullups ?? "n/a"}, squat ${answers.squatKg ?? "n/a"}kg.
- Trains ${answers.daysPerWeek} days/week (${answers.preferredDays.join(", ") || "flexible"}), ${answers.sessionMin} min sessions.
- Equipment: ${answers.equipment.join(", ")}. Prefers ${answers.equipmentPref}.
- Cannot do: ${answers.cannotDo.join(", ") || "nothing"}.
- Injuries/limitations: ${answers.injuries.join(", ") || "none"}.
- Sleep: ${answers.sleepHours}h. Steps: ${answers.dailySteps}. Dieting: ${answers.dieting ? "yes (deficit)" : "no"}.

PROGRAM
- Split: ${program.title}
- Weekly volume: ${program.weeklyVolume.map((v) => `${v.muscle} ${v.sets}`).join(", ")}
- Schedule: ${program.weeklySchedule.map((s) => `${s.day}: ${s.focus}`).join(" | ")}

TASK: Write ONE paragraph (the "Why this program works for you" intro) explaining why this split, volume, and exercise selection suit this specific athlete — reference their goal, schedule, experience, injuries, and the dieting/recovery context. Be specific, not generic.`;

  try {
    if (p === "anthropic") {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY!,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 400,
          system,
          messages: [{ role: "user", content: user }],
        }),
      });
      if (!res.ok) return { ok: false, error: `Anthropic error ${res.status}` };
      const data = await res.json();
      return { ok: true, rationale: data.content?.[0]?.text?.trim() };
    }

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 400,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    if (!res.ok) return { ok: false, error: `OpenAI error ${res.status}` };
    const data = await res.json();
    return { ok: true, rationale: data.choices?.[0]?.message?.content?.trim() };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown LLM error" };
  }
}