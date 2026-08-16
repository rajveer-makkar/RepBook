-- Defense-in-depth: default user_id to the calling user on direct inserts
-- so a row can never be created unowned. RLS "with check (user_id = auth.uid())"
-- still rejects any insert that doesn't match the caller.
alter table public.programs alter column user_id set default auth.uid();
alter table public.sessions alter column user_id set default auth.uid();
alter table public.body_metrics alter column user_id set default auth.uid();
alter table public.custom_exercises alter column user_id set default auth.uid();