-- Gains — starter workout templates
-- Creates 4 core templates + 1 optional template as DEFAULT templates,
-- visible to every user (user_id null, is_default true — see schema.sql).
-- Run after schema.sql. Safe to re-run: does not duplicate templates
-- or their exercises.
--
-- Requires the templates.is_default column from the updated schema.sql
-- — run that migration first if you seeded templates before this change.

-- If you ran an earlier version of this script before `is_default`
-- existed, these 5 templates are currently owned by your own account.
-- Promote them to shared defaults in place instead of duplicating them.
update templates
set user_id = null, is_default = true
where user_id is not null
  and is_default = false
  and name in (
    'Upper Body — Chest & Back',
    'Lower Body — Quads & Hamstrings',
    'Upper Body — Back & Shoulders',
    'Lower Body — Legs & Glutes',
    'Shoulders & Arms — Optional'
  );

do $$
begin
  ------------------------------------------------------------
  -- 1. Create templates
  ------------------------------------------------------------
  insert into templates (user_id, name, is_default)
  select null, v.name, true
  from (
    values
      ('Upper Body — Chest & Back'),
      ('Lower Body — Quads & Hamstrings'),
      ('Upper Body — Back & Shoulders'),
      ('Lower Body — Legs & Glutes'),
      ('Shoulders & Arms — Optional')
  ) as v(name)
  where not exists (
    select 1
    from templates t
    where t.user_id is null
      and t.is_default
      and t.name = v.name
  );

  ------------------------------------------------------------
  -- 2. Upper Body — Chest & Back
  ------------------------------------------------------------
  insert into template_exercises (template_id, exercise_db_id, position)
  select t.id, e.id, v.position
  from (
    values
      ('Bench Press', 1),
      ('Lat Pulldown', 2),
      ('Incline Dumbbell Press', 3),
      ('Chest Supported Row', 4),
      ('Dumbbell Shoulder Press', 5),
      ('Dumbbell Lateral Raise', 6),
      ('Cable Triceps Pushdown', 7),
      ('Dumbbell Biceps Curl', 8)
  ) as v(exercise_name, position)
  join templates t
    on t.name = 'Upper Body — Chest & Back'
    and t.user_id is null
    and t.is_default
  join exercise_definitions e
    on e.name = v.exercise_name
  where not exists (
    select 1 from template_exercises te
    where te.template_id = t.id and te.exercise_db_id = e.id
  );

  ------------------------------------------------------------
  -- 3. Lower Body — Quads & Hamstrings
  ------------------------------------------------------------
  insert into template_exercises (template_id, exercise_db_id, position)
  select t.id, e.id, v.position
  from (
    values
      ('Leg Press', 1),
      ('Leg Extension', 2),
      ('Seated Leg Curl', 3),
      ('Bulgarian Split Squat', 4),
      ('Hip Thrust', 5),
      ('Standing Calf Raise', 6),
      ('Cable Crunch', 7)
  ) as v(exercise_name, position)
  join templates t
    on t.name = 'Lower Body — Quads & Hamstrings'
    and t.user_id is null
    and t.is_default
  join exercise_definitions e
    on e.name = v.exercise_name
  where not exists (
    select 1 from template_exercises te
    where te.template_id = t.id and te.exercise_db_id = e.id
  );

  ------------------------------------------------------------
  -- 4. Upper Body — Back & Shoulders
  ------------------------------------------------------------
  insert into template_exercises (template_id, exercise_db_id, position)
  select t.id, e.id, v.position
  from (
    values
      ('Seated Cable Row', 1),
      ('Incline Machine Chest Press', 2),
      ('Neutral Grip Lat Pulldown', 3),
      ('Machine Chest Press', 4),
      ('Machine Shoulder Press', 5),
      ('Cable Lateral Raise', 6),
      ('Reverse Pec Deck', 7),
      ('Hammer Curl', 8),
      ('Rope Triceps Pushdown', 9)
  ) as v(exercise_name, position)
  join templates t
    on t.name = 'Upper Body — Back & Shoulders'
    and t.user_id is null
    and t.is_default
  join exercise_definitions e
    on e.name = v.exercise_name
  where not exists (
    select 1 from template_exercises te
    where te.template_id = t.id and te.exercise_db_id = e.id
  );

  ------------------------------------------------------------
  -- 5. Lower Body — Legs & Glutes
  ------------------------------------------------------------
  insert into template_exercises (template_id, exercise_db_id, position)
  select t.id, e.id, v.position
  from (
    values
      ('Hack Squat', 1),
      ('Leg Press', 2),
      ('Lying Leg Curl', 3),
      ('Reverse Lunge', 4),
      ('Glute Bridge', 5),
      ('Seated Calf Raise', 6),
      ('Hanging Knee Raise', 7)
  ) as v(exercise_name, position)
  join templates t
    on t.name = 'Lower Body — Legs & Glutes'
    and t.user_id is null
    and t.is_default
  join exercise_definitions e
    on e.name = v.exercise_name
  where not exists (
    select 1 from template_exercises te
    where te.template_id = t.id and te.exercise_db_id = e.id
  );

  ------------------------------------------------------------
  -- 6. Shoulders & Arms — Optional
  ------------------------------------------------------------
  insert into template_exercises (template_id, exercise_db_id, position)
  select t.id, e.id, v.position
  from (
    values
      ('Machine Shoulder Press', 1),
      ('Cable Lateral Raise', 2),
      ('Reverse Pec Deck', 3),
      ('Face Pull', 4),
      ('Incline Dumbbell Curl', 5),
      ('Hammer Curl', 6),
      ('Cable Triceps Pushdown', 7),
      ('Overhead Cable Triceps Extension', 8)
  ) as v(exercise_name, position)
  join templates t
    on t.name = 'Shoulders & Arms — Optional'
    and t.user_id is null
    and t.is_default
  join exercise_definitions e
    on e.name = v.exercise_name
  where not exists (
    select 1 from template_exercises te
    where te.template_id = t.id and te.exercise_db_id = e.id
  );
end $$;
