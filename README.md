# RepBook — Workout Program Generator & Gym Logger

A Supabase-backed workout app that generates a personalized training program from a ~40-question profile and lets you log your workouts in the gym. The program engine is **fully deterministic** — the same answers always produce the same program.

## Features

- **Program generator** — 9-section questionnaire (basic profile, goal, availability, experience, gym equipment, exercise preferences, pain/injury, recovery, program prefs) with conditional questions.
- **Deterministic engine** — picks your split (Full Body / Push-Pull-Legs / Upper-Lower / + Accessories), sets, rep ranges, RIR, rest, weekly volume, progression rules, deload schedule, and 12-week framework. Never exceeds your max session length.
- **Exercise swapping** — remove any exercise from a generated program, say why (machine unavailable, injury concern, pain, dislike), and get same-muscle-group replacements filtered by that reason.
- **In-gym logging** — start/complete sessions, log weight × reps per set with a rest timer, offline drafts, progression suggestions based on your last session.
- **Body metrics + calendar** — log weight/waist/body-fat and see your training streak on a calendar.
- **PWA / offline** — installable on iOS/Android, service worker caches the app for gym use without signal.
- **AI explanation (optional)** — a one-click "explain why this works" summary. The AI only *explains* — it never decides programming.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack) + React 19 + TypeScript
- [Tailwind CSS 4](https://tailwindcss.com)
- [Supabase](https://supabase.com) (Postgres, Auth, Row Level Security)
- [hugeicons-react](https://hugeicons.com) — icons

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

### Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL (Project Settings → API) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key — safe to expose to the browser |
| `ANTHROPIC_API_KEY` | No | Powers the "AI explain" button |
| `OPENAI_API_KEY` | No | Alternative to Anthropic |

### Database

Run the migrations in `supabase/migrations/` against your Supabase project (in order):

- `0001_init.sql` — schema, RLS, auth trigger
- `0002_user_id_defaults.sql` — defensive default to the calling user
- `0003_session_feedback.sql` — post-workout feedback columns (adaptive programming groundwork)

Auth is set up for email signups. In Supabase Dashboard → Authentication, enable **Email** provider and turn off "Confirm email" if you want instant sign-up.

## Development

```bash
npm run dev      # start dev server
npm run lint     # eslint
npm run build    # production build + type check
npm run start    # serve the production build
npx tsx scripts/check-engine.ts      # engine assertions (deterministic checks)
npx tsx scripts/check-progression.ts # progression logic checks
```

## Project structure

```
app/                  # Next.js App Router routes + API routes
components/           # Questionnaire, Results, WorkoutLogger, nav, PWA helper
lib/
  engine.ts           # deterministic program generation + swap/replacement logic
  exercises.ts        # exercise database (muscles, equipment, risks, substitutions)
  types.ts            # Answers profile, Program, shared types
  actions/            # server actions (programs, sessions, metrics)
  supabase/           # server + browser Supabase clients
scripts/              # standalone engine/progression check scripts
supabase/migrations/  # SQL schema migrations
```

## License

MIT