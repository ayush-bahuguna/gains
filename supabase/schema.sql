-- Gains (Workout Journal) — schema + RLS
-- Run this in the Supabase Dashboard SQL Editor (Project → SQL Editor → New query).
-- Safe to re-run: everything is guarded with IF NOT EXISTS / DROP POLICY IF EXISTS.

create extension if not exists pgcrypto;

-- ─────────────────────────────────────────────────────────
-- exercise_definitions — shared reference table, no user_id
-- ─────────────────────────────────────────────────────────
create table if not exists exercise_definitions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  aliases text[] not null default '{}',
  primary_muscle text,
  category text,
  equipment text,
  placeholder_image_url text,
  created_at timestamptz not null default now()
);

-- Added after the initial table creation — safe to re-run. Holds the
-- "peak" pose image (start pose lives in placeholder_image_url) for
-- exercises where the source dataset provides both.
alter table exercise_definitions add column if not exists placeholder_image_url_peak text;

-- Added after the initial table creation — safe to re-run. Short how-to +
-- muscles-targeted blurb shown alongside the exercise.
alter table exercise_definitions add column if not exists description text;

alter table exercise_definitions enable row level security;

drop policy if exists "exercise_definitions readable by authenticated users"
  on exercise_definitions;
create policy "exercise_definitions readable by authenticated users"
  on exercise_definitions for select
  to authenticated
  using (true);

-- No insert/update/delete policies for exercise_definitions: the client
-- never writes to this table. It's managed manually via the SQL editor
-- (or the service role) as an admin-curated reference list.

-- ─────────────────────────────────────────────────────────
-- workout_sessions
-- ─────────────────────────────────────────────────────────
create table if not exists workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null default 'Workout',
  date date not null default current_date,
  start_time timestamptz not null default now(),
  end_time timestamptz,
  duration interval generated always as (end_time - start_time) stored,
  notes text not null default '',
  motivation_gif_url text,
  motivation_quote text,
  created_at timestamptz not null default now()
);

-- Added after the initial table creation — safe to re-run.
alter table workout_sessions add column if not exists motivation_gif_url text;
alter table workout_sessions add column if not exists motivation_quote text;

create index if not exists workout_sessions_user_id_date_idx
  on workout_sessions (user_id, date desc);

alter table workout_sessions enable row level security;

drop policy if exists "workout_sessions owner access" on workout_sessions;
create policy "workout_sessions owner access"
  on workout_sessions for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────
-- exercises — session-scoped exercise instances
-- ─────────────────────────────────────────────────────────
create table if not exists exercises (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references workout_sessions(id) on delete cascade,
  exercise_db_id uuid references exercise_definitions(id),
  name text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists exercises_session_id_idx on exercises (session_id);

alter table exercises enable row level security;

drop policy if exists "exercises owner access" on exercises;
create policy "exercises owner access"
  on exercises for all
  to authenticated
  using (
    exists (
      select 1 from workout_sessions ws
      where ws.id = exercises.session_id and ws.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from workout_sessions ws
      where ws.id = exercises.session_id and ws.user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────
-- sets
-- ─────────────────────────────────────────────────────────
create table if not exists sets (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid not null references exercises(id) on delete cascade,
  set_number integer not null,
  weight numeric(6, 2) not null default 0,
  reps integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists sets_exercise_id_idx on sets (exercise_id);

alter table sets enable row level security;

drop policy if exists "sets owner access" on sets;
create policy "sets owner access"
  on sets for all
  to authenticated
  using (
    exists (
      select 1 from exercises e
      join workout_sessions ws on ws.id = e.session_id
      where e.id = sets.exercise_id and ws.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from exercises e
      join workout_sessions ws on ws.id = e.session_id
      where e.id = sets.exercise_id and ws.user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────
-- templates
-- ─────────────────────────────────────────────────────────
create table if not exists templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- Added after the initial table creation — safe to re-run.
alter table templates alter column user_id drop not null;
alter table templates add column if not exists is_default boolean not null default false;

alter table templates enable row level security;

-- Default templates (user_id is null, is_default = true) are readable by
-- everyone but only ever written by an admin via the SQL editor/service
-- role, which bypasses RLS — no insert/update/delete policy grants them
-- to regular users. Custom templates remain fully owner-controlled.
drop policy if exists "templates owner access" on templates;
drop policy if exists "templates select" on templates;
drop policy if exists "templates insert" on templates;
drop policy if exists "templates update" on templates;
drop policy if exists "templates delete" on templates;

create policy "templates select"
  on templates for select
  to authenticated
  using (user_id = auth.uid() or is_default);

create policy "templates insert"
  on templates for insert
  to authenticated
  with check (user_id = auth.uid() and not is_default);

create policy "templates update"
  on templates for update
  to authenticated
  using (user_id = auth.uid() and not is_default)
  with check (user_id = auth.uid() and not is_default);

create policy "templates delete"
  on templates for delete
  to authenticated
  using (user_id = auth.uid() and not is_default);

-- ─────────────────────────────────────────────────────────
-- template_exercises — exercise list for a template (no sets)
-- ─────────────────────────────────────────────────────────
create table if not exists template_exercises (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references templates(id) on delete cascade,
  exercise_db_id uuid not null references exercise_definitions(id),
  position integer not null default 0
);

create index if not exists template_exercises_template_id_idx
  on template_exercises (template_id);

alter table template_exercises enable row level security;

drop policy if exists "template_exercises owner access" on template_exercises;
drop policy if exists "template_exercises select" on template_exercises;
drop policy if exists "template_exercises write" on template_exercises;

create policy "template_exercises select"
  on template_exercises for select
  to authenticated
  using (
    exists (
      select 1 from templates t
      where t.id = template_exercises.template_id
        and (t.user_id = auth.uid() or t.is_default)
    )
  );

-- Insert/update/delete only reach templates owned by the caller — the
-- owner check alone rules out default templates, since those have a
-- null user_id.
create policy "template_exercises write"
  on template_exercises for all
  to authenticated
  using (
    exists (
      select 1 from templates t
      where t.id = template_exercises.template_id and t.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from templates t
      where t.id = template_exercises.template_id and t.user_id = auth.uid()
    )
  );
