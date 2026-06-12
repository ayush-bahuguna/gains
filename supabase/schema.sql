-- Run this in Supabase SQL Editor first, then seed.sql

CREATE TABLE profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name  text,
  nickname      text,
  weight_kg     decimal(5,2),
  height_cm     decimal(5,1),
  unit_pref     text DEFAULT 'kg' CHECK (unit_pref IN ('kg', 'lbs')),
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE exercises (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  muscle      text,
  equipment   text,
  category    text,
  is_default  boolean DEFAULT false,
  created_by  uuid REFERENCES auth.users(id)
);

CREATE TABLE workout_sessions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at    timestamptz NOT NULL DEFAULT now(),
  ended_at      timestamptz,
  duration_secs integer,
  notes         text,
  energy_level  smallint CHECK (energy_level BETWEEN 1 AND 5),
  is_active     boolean DEFAULT true,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE session_exercises (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id   uuid NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_id  uuid NOT NULL REFERENCES exercises(id),
  order_index  integer NOT NULL
);

CREATE TABLE sets (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_exercise_id uuid NOT NULL REFERENCES session_exercises(id) ON DELETE CASCADE,
  set_number          integer NOT NULL,
  set_type            char(1) DEFAULT 'N' CHECK (set_type IN ('W','N','D')),
  weight_kg           decimal(6,2),
  reps                integer,
  completed           boolean DEFAULT false,
  completed_at        timestamptz
);

CREATE TABLE favorite_exercises (
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, exercise_id)
);

-- Row Level Security
ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_exercises  ENABLE ROW LEVEL SECURITY;
ALTER TABLE sets               ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises          ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own profile"
  ON profiles FOR ALL USING (auth.uid() = id);

CREATE POLICY "own sessions"
  ON workout_sessions FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "own session exercises"
  ON session_exercises FOR ALL USING (
    session_id IN (SELECT id FROM workout_sessions WHERE user_id = auth.uid())
  );

CREATE POLICY "own sets"
  ON sets FOR ALL USING (
    session_exercise_id IN (
      SELECT se.id FROM session_exercises se
      JOIN workout_sessions ws ON se.session_id = ws.id
      WHERE ws.user_id = auth.uid()
    )
  );

CREATE POLICY "own favorites"
  ON favorite_exercises FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "read exercises"
  ON exercises FOR SELECT USING (is_default OR created_by = auth.uid());

CREATE POLICY "insert custom exercise"
  ON exercises FOR INSERT WITH CHECK (created_by = auth.uid());
