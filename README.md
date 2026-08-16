# RepBook — Workout Program Generator & Gym Logger

A Supabase-backed PWA that turns a ~40-question profile into a personalized hypertrophy program, then lives in your pocket during the workout: log sets, track strength, and watch your streak grow — even offline.

The program engine is **fully deterministic**: the same answers always produce the same program. No AI guessing on the parts that matter.

## Features

- **Program generator** — a 9-section questionnaire (basic profile, goal, training availability, experience, gym & equipment, exercise preferences, pain/injury, recovery & lifestyle, program preferences) with conditional questions that adapt as you answer.
- **Deterministic rule engine** — picks your split (Full Body / Push-Pull-Legs / Upper-Lower / Upper-Lower + Accessories), per-muscle weekly volume, set & rep schemes, RIR targets, rest times, progression rules, and a 12-week framework. It respects hard limits: your max session length is never exceeded, beginner compound volumes are capped, and low-recovery weeks trim isolation sets.
- **Exercise swapping** — remove any exercise from a generated program and say why (machine unavailable, injury concern, pain, dislike). Get same-muscle-group replacements filtered by that reason — or just drop it.
- **In-gym workout logging** — start a session from today's scheduled workout, log weight × reps per set with a rest timer, save offline drafts, and get progression suggestions based on your last session for the same exercise.
- **Body metrics & calendar** — log weight/waist/body-fat and see your training history on a calendar with current streak.
- **PWA / offline** — installable on iOS/Android home screens; the service worker caches the app shell for gym use without signal.
- **AI explanation (optional)** — a one-click "why this program works for you" summary. The AI only *explains* the engine's decision — it never makes programming decisions.
- **Row Level Security** — every table is locked to the authenticated owner; all writes default `user_id` to `auth.uid()`.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack) + React 19 + TypeScript
- [Tailwind CSS 4](https://tailwindcss.com)
- [Supabase](https://supabase.com) — Postgres, Auth, Row Level Security
- [hugeicons-react](https://hugeicons.com) — icons

## Getting started

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run the migrations in `supabase/migrations/` **in order** (`0001` → `0003`).
3. In **Project Settings → API**, copy the project URL and the **anon** public key.
4. In **Authentication → Providers**, enable **Email** and (if you want instant sign-up) turn off "Confirm email".

### 2. Local development

```bash
npm install
cp .env.example .env.local   # fill in the values
npm run dev
```

Open http://localhost:3000.

### 3. Deploy to Vercel

1. Import the repo at [vercel.com/new](https://vercel.com/new).
2. Add the same environment variables from the table below.
3. Deploy — done. No build config needed (Next.js defaults handle it).

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL (Project Settings → API) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase **anon** key — safe to expose to the browser |
| `ANTHROPIC_API_KEY` | No | Powers the "AI explain" button (Anthropic) |
| `OPENAI_API_KEY` | No | Alternative to Anthropic for the "AI explain" button |

The "AI explain" feature degrades gracefully: with no key configured the button is disabled and the feature is skipped — the engine still generates full programs.

## How the engine works

1. **Questionnaire** → a typed `Answers` profile (~40 fields): goals & priorities, weekly availability, experience and 1RMs, equipment, muscle-group and exercise preferences, pain/injury restrictions, recovery/lifestyle signals.
2. **Split selection** — `pickSplit` maps availability (2–6 days) to a split and a weekly schedule, honoring rest-spacing requirements.
3. **Volume & intensity** — per-muscle weekly sets come from the goal and recovery level, then compounds and isolations are distributed with rep ranges, RIR, rest, and session-length caps.
4. **Progression & swaps** — 12-week framework with a scheduled deload; `applySwaps` replaces banned/removed exercises with same-muscle substitutes and `validate` emits human-readable warnings (e.g. "this week exceeds your session cap").
5. **Determinism** — no randomness. The same `Answers` object always yields the same program, which is what makes `scripts/check-engine.ts` assertions meaningful.

## Development

```bash
npm run dev                          # start dev server
npm run lint                         # eslint
npm run build                        # production build + type check
npx tsx scripts/check-engine.ts      # 15 engine assertions (deterministic guarantees)
npx tsx scripts/check-progression.ts # progression logic checks
```

## Project structure

```
app/                  # Next.js App Router routes + API routes
  api/enhance/        # POST /api/enhance — AI explanation (rate-limited)
components/           # Questionnaire, Results, WorkoutLogger, nav, PWA helper
lib/
  engine.ts           # deterministic program generation + swap/replacement logic
  exercises.ts        # exercise database (muscles, equipment, risks, substitutions)
  types.ts            # Answers profile, Program, shared types
  actions/            # server actions (programs, sessions, metrics, profile)
  supabase/           # server + browser Supabase clients (all route through RLS)
scripts/              # standalone engine/progression check scripts
supabase/migrations/  # SQL schema migrations (apply in order)
```

## License

MIT — see [LICENSE](LICENSE).