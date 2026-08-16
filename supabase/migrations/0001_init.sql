-- RepBook: initial schema, RLS, and auth trigger.

create extension if not exists "pgcrypto";

-- ---- profiles -------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  sex text check (sex in ('male', 'female')),
  height_cm numeric,
  age int,
  sleep_hours text,
  activity text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---- programs -------------------------------------------------------------
create table public.programs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'My Program',
  answers jsonb not null default '{}'::jsonb,
  split_label text,
  rationale text,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index programs_user_id_idx on public.programs (user_id);

-- ---- workout_templates ------------------------------------------------------
create table public.workout_templates (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  day_name text,
  focus text,
  position int not null default 0,
  duration_min int,
  created_at timestamptz not null default now()
);

create index workout_templates_program_id_idx on public.workout_templates (program_id);

-- ---- exercise_templates -----------------------------------------------------
create table public.exercise_templates (
  id uuid primary key default gen_random_uuid(),
  workout_template_id uuid not null references public.workout_templates(id) on delete cascade,
  exercise_id text not null,
  name text not null,
  position int not null default 0,
  sets int not null default 3,
  reps_min int,
  reps_max int,
  reps_label text,
  rir int,
  rest_sec int,
  notes text,
  created_at timestamptz not null default now()
);

create index exercise_templates_workout_id_idx on public.exercise_templates (workout_template_id);

-- ---- sessions ----------------------------------------------------------------
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  program_id uuid references public.programs(id) on delete set null,
  workout_template_id uuid references public.workout_templates(id) on delete set null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  status text not null default 'in_progress'
    check (status in ('in_progress', 'completed', 'partial')),
  notes text,
  created_at timestamptz not null default now()
);

create index sessions_user_id_idx on public.sessions (user_id);
create index sessions_started_at_idx on public.sessions (started_at);

-- ---- set_logs -----------------------------------------------------------------
create table public.set_logs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  exercise_template_id uuid references public.exercise_templates(id) on delete set null,
  exercise_name text not null,
  set_number int not null default 1,
  weight_kg numeric,
  reps int,
  rir_felt int,
  is_completed boolean not null default true,
  created_at timestamptz not null default now()
);

create index set_logs_session_id_idx on public.set_logs (session_id);

-- ---- body_metrics -----------------------------------------------------------------
create table public.body_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default current_date,
  weight_kg numeric,
  waist_cm numeric,
  body_fat_pct numeric,
  photo_url text,
  created_at timestamptz not null default now()
);

create index body_metrics_user_date_idx on public.body_metrics (user_id, date desc);

-- ---- custom_exercises -------------------------------------------------------------
create table public.custom_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  muscles jsonb not null default '[]'::jsonb,
  equipment jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index custom_exercises_user_id_idx on public.custom_exercises (user_id);

-- ---- user_settings ---------------------------------------------------------------
create table public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  unit text not null default 'kg' check (unit in ('kg', 'lb')),
  rest_timer_default int not null default 90,
  updated_at timestamptz not null default now()
);

-- ---- RLS ----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.programs enable row level security;
alter table public.workout_templates enable row level security;
alter table public.exercise_templates enable row level security;
alter table public.sessions enable row level security;
alter table public.set_logs enable row level security;
alter table public.body_metrics enable row level security;
alter table public.custom_exercises enable row level security;
alter table public.user_settings enable row level security;

create policy "own profile" on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

create policy "own programs" on public.programs
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own workout templates" on public.workout_templates
  for all using (
    exists (select 1 from public.programs p where p.id = program_id and p.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.programs p where p.id = program_id and p.user_id = auth.uid())
  );

create policy "own exercise templates" on public.exercise_templates
  for all using (
    exists (
      select 1 from public.workout_templates wt
      join public.programs p on p.id = wt.program_id
      where wt.id = workout_template_id and p.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.workout_templates wt
      join public.programs p on p.id = wt.program_id
      where wt.id = workout_template_id and p.user_id = auth.uid()
    )
  );

create policy "own sessions" on public.sessions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own set logs" on public.set_logs
  for all using (
    exists (select 1 from public.sessions s where s.id = session_id and s.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.sessions s where s.id = session_id and s.user_id = auth.uid())
  );

create policy "own body metrics" on public.body_metrics
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own custom exercises" on public.custom_exercises
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own settings" on public.user_settings
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---- auth trigger: auto-create profile + settings on signup -----------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );
  insert into public.user_settings (user_id)
  values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();