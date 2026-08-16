-- Adaptive programming groundwork: post-workout feedback captured on sessions
-- so the engine can later adjust future volume/deloads/progressions.
-- Fields are nullable so existing rows and older clients are unaffected.

alter table public.sessions
  add column if not exists difficulty text
    check (difficulty in ('easy', 'good', 'hard', 'brutal'));
alter table public.sessions
  add column if not exists performance text
    check (performance in ('better', 'same', 'worse'));
alter table public.sessions
  add column if not exists pain jsonb not null default '[]'::jsonb;
alter table public.sessions
  add column if not exists feedback_notes text;