-- Gains — starter exercise_definitions data
-- Run after schema.sql. Safe to re-run: skips names that already exist.

insert into exercise_definitions (name, aliases, primary_muscle, category, equipment)
select * from (values
  ('Bench Press', array['bench', 'flat bench', 'barbell bench press'], 'chest', 'push', 'barbell'),
  ('Incline Bench Press', array['incline bench', 'incline press'], 'chest', 'push', 'barbell'),
  ('Dumbbell Bench Press', array['dumbbell bench', 'db bench press'], 'chest', 'push', 'dumbbell'),
  ('Incline Dumbbell Press', array['incline db press'], 'chest', 'push', 'dumbbell'),
  ('Chest Fly', array['dumbbell fly', 'pec fly', 'cable fly'], 'chest', 'push', 'dumbbell'),
  ('Push Up', array['pushup', 'push-up'], 'chest', 'push', 'bodyweight'),
  ('Overhead Press', array['ohp', 'shoulder press', 'military press'], 'shoulders', 'push', 'barbell'),
  ('Dumbbell Shoulder Press', array['db shoulder press'], 'shoulders', 'push', 'dumbbell'),
  ('Lateral Raise', array['side raise', 'db lateral raise'], 'shoulders', 'push', 'dumbbell'),
  ('Front Raise', array['db front raise'], 'shoulders', 'push', 'dumbbell'),
  ('Rear Delt Fly', array['reverse fly', 'rear delt raise'], 'shoulders', 'pull', 'dumbbell'),
  ('Tricep Pushdown', array['cable pushdown', 'rope pushdown'], 'triceps', 'push', 'cable'),
  ('Tricep Dip', array['dips', 'bench dip'], 'triceps', 'push', 'bodyweight'),
  ('Skull Crusher', array['lying tricep extension', 'ez bar skull crusher'], 'triceps', 'push', 'barbell'),
  ('Deadlift', array['conventional deadlift'], 'back', 'pull', 'barbell'),
  ('Romanian Deadlift', array['rdl'], 'hamstrings', 'pull', 'barbell'),
  ('Barbell Row', array['bent over row', 'bb row'], 'back', 'pull', 'barbell'),
  ('Dumbbell Row', array['db row', 'one arm row', 'single arm row'], 'back', 'pull', 'dumbbell'),
  ('Pull Up', array['pullup', 'pull-up'], 'back', 'pull', 'bodyweight'),
  ('Chin Up', array['chinup', 'chin-up'], 'back', 'pull', 'bodyweight'),
  ('Lat Pulldown', array['pulldown', 'cable pulldown'], 'back', 'pull', 'cable'),
  ('Seated Cable Row', array['cable row', 'seated row'], 'back', 'pull', 'cable'),
  ('Bicep Curl', array['dumbbell curl', 'db curl', 'curl'], 'biceps', 'pull', 'dumbbell'),
  ('Barbell Curl', array['bb curl'], 'biceps', 'pull', 'barbell'),
  ('Hammer Curl', array['db hammer curl'], 'biceps', 'pull', 'dumbbell'),
  ('Squat', array['barbell squat', 'back squat'], 'legs', 'legs', 'barbell'),
  ('Front Squat', array['front barbell squat'], 'legs', 'legs', 'barbell'),
  ('Leg Press', array['leg press machine'], 'legs', 'legs', 'machine'),
  ('Lunge', array['walking lunge', 'dumbbell lunge'], 'legs', 'legs', 'dumbbell'),
  ('Leg Extension', array['quad extension'], 'quads', 'legs', 'machine'),
  ('Leg Curl', array['hamstring curl', 'lying leg curl'], 'hamstrings', 'legs', 'machine'),
  ('Calf Raise', array['standing calf raise', 'seated calf raise'], 'calves', 'legs', 'machine'),
  ('Hip Thrust', array['barbell hip thrust', 'glute bridge'], 'glutes', 'legs', 'barbell'),
  ('Plank', array['front plank'], 'core', 'core', 'bodyweight'),
  ('Crunch', array['ab crunch', 'sit up', 'situp'], 'core', 'core', 'bodyweight'),
  ('Hanging Leg Raise', array['leg raise'], 'core', 'core', 'bodyweight'),
  ('Russian Twist', array['twist'], 'core', 'core', 'bodyweight'),
  ('Face Pull', array['cable face pull'], 'shoulders', 'pull', 'cable'),
  ('Shrug', array['barbell shrug', 'dumbbell shrug'], 'traps', 'pull', 'barbell'),
  ('Farmer Carry', array['farmers walk', 'farmer walk'], 'full body', 'carry', 'dumbbell')
) as v(name, aliases, primary_muscle, category, equipment)
where not exists (
  select 1 from exercise_definitions ed where ed.name = v.name
);

-- ─────────────────────────────────────────────────────────
-- Extended exercise list — Upper Body / Shoulders / Arms / Lower Body / Core
-- Skips any name already present above (e.g. Bench Press, Lat Pulldown,
-- Face Pull, Romanian Deadlift, Hip Thrust, Leg Press, Leg Extension,
-- Hammer Curl, Plank, Seated Cable Row, Dumbbell Shoulder Press).
-- ─────────────────────────────────────────────────────────
insert into exercise_definitions (name, aliases, primary_muscle, category, equipment)
select * from (values
  -- Upper Body - Chest
  ('Incline Barbell Bench Press', array['incline bench', 'incline barbell press'], 'chest', 'push', 'barbell'),
  ('Machine Chest Press', array['chest press', 'chest press machine'], 'chest', 'push', 'machine'),
  ('Incline Machine Chest Press', array['incline chest press machine'], 'chest', 'push', 'machine'),
  ('Cable Chest Fly', array['cable fly', 'cable crossover'], 'chest', 'push', 'cable'),
  ('Pec Deck', array['pec fly', 'chest fly machine', 'machine fly'], 'chest', 'push', 'machine'),
  ('Push-Up', array['pushup', 'press up'], 'chest', 'push', 'bodyweight'),

  -- Upper Body - Back
  ('Neutral Grip Lat Pulldown', array['neutral pulldown', 'close neutral pulldown'], 'back', 'pull', 'machine'),
  ('Close Grip Lat Pulldown', array['close grip pulldown'], 'back', 'pull', 'machine'),
  ('Assisted Pull-Up', array['assisted pullup', 'assisted chin up'], 'back', 'pull', 'machine'),
  ('Pull-Up', array['pullup', 'bodyweight pullup'], 'back', 'pull', 'bodyweight'),
  ('Chin-Up', array['chinup', 'underhand pullup'], 'back', 'pull', 'bodyweight'),
  ('Single Arm Cable Row', array['one arm cable row', 'unilateral cable row'], 'back', 'pull', 'cable'),
  ('Chest Supported Row', array['chest supported dumbbell row', 'incline dumbbell row'], 'back', 'pull', 'dumbbell'),
  ('Machine Row', array['rowing machine', 'machine back row'], 'back', 'pull', 'machine'),

  -- Shoulders
  ('Machine Shoulder Press', array['shoulder press machine', 'machine overhead press'], 'shoulders', 'push', 'machine'),
  ('Barbell Overhead Press', array['overhead press', 'military press', 'barbell shoulder press'], 'shoulders', 'push', 'barbell'),
  ('Arnold Press', array['arnold dumbbell press'], 'shoulders', 'push', 'dumbbell'),
  ('Dumbbell Lateral Raise', array['lateral raise', 'side raise', 'db lateral raise'], 'shoulders', 'isolation', 'dumbbell'),
  ('Cable Lateral Raise', array['cable side raise', 'single arm cable lateral raise'], 'shoulders', 'isolation', 'cable'),
  ('Reverse Pec Deck', array['rear delt fly machine', 'reverse fly machine'], 'rear delts', 'pull', 'machine'),
  ('Cable Rear Delt Fly', array['rear delt cable fly', 'cable reverse fly'], 'rear delts', 'pull', 'cable'),

  -- Arms - Triceps
  ('Cable Triceps Pushdown', array['tricep pushdown', 'triceps pressdown', 'rope pushdown'], 'triceps', 'push', 'cable'),
  ('Rope Triceps Pushdown', array['rope pushdown', 'rope tricep extension'], 'triceps', 'push', 'cable'),
  ('Overhead Cable Triceps Extension', array['overhead tricep extension', 'cable overhead extension'], 'triceps', 'push', 'cable'),
  ('Single Arm Cable Triceps Extension', array['one arm tricep extension', 'single arm pushdown'], 'triceps', 'push', 'cable'),
  ('Dumbbell Skull Crusher', array['dumbbell tricep extension', 'lying dumbbell extension'], 'triceps', 'push', 'dumbbell'),
  ('EZ Bar Skull Crusher', array['skull crusher', 'lying tricep extension'], 'triceps', 'push', 'barbell'),

  -- Arms - Biceps
  ('Dumbbell Biceps Curl', array['db curl', 'dumbbell curl'], 'biceps', 'pull', 'dumbbell'),
  ('Incline Dumbbell Curl', array['incline db curl', 'incline curl'], 'biceps', 'pull', 'dumbbell'),
  ('Preacher Curl', array['preacher bicep curl', 'preacher machine curl'], 'biceps', 'pull', 'machine'),
  ('EZ Bar Curl', array['ez curl', 'ez bar bicep curl'], 'biceps', 'pull', 'barbell'),
  ('Cable Biceps Curl', array['cable curl', 'standing cable curl'], 'biceps', 'pull', 'cable'),
  ('Reverse Curl', array['reverse bicep curl'], 'biceps', 'pull', 'barbell'),

  -- Lower Body - Quads
  ('Hack Squat', array['hack squat machine'], 'quads', 'legs', 'machine'),
  ('Smith Machine Squat', array['smith squat', 'smith machine squat'], 'quads', 'legs', 'machine'),
  ('Goblet Squat', array['dumbbell goblet squat'], 'quads', 'legs', 'dumbbell'),
  ('Bulgarian Split Squat', array['bulgarian squat', 'rear foot elevated split squat'], 'quads', 'legs', 'dumbbell'),
  ('Reverse Lunge', array['reverse lunges', 'dumbbell reverse lunge'], 'quads', 'legs', 'dumbbell'),
  ('Walking Lunge', array['walking lunges', 'dumbbell walking lunge'], 'quads', 'legs', 'dumbbell'),
  ('Step-Up', array['step ups', 'dumbbell step up'], 'quads', 'legs', 'dumbbell'),

  -- Lower Body - Hamstrings
  ('Seated Leg Curl', array['seated hamstring curl', 'seated leg curl machine'], 'hamstrings', 'legs', 'machine'),
  ('Lying Leg Curl', array['lying hamstring curl', 'prone leg curl', 'leg curl machine'], 'hamstrings', 'legs', 'machine'),
  ('Single Leg Curl', array['single leg hamstring curl', 'unilateral leg curl'], 'hamstrings', 'legs', 'machine'),
  ('Cable Leg Curl', array['standing cable leg curl', 'cable hamstring curl'], 'hamstrings', 'legs', 'cable'),
  ('Dumbbell Romanian Deadlift', array['dumbbell rdl', 'db rdl'], 'hamstrings', 'hinge', 'dumbbell'),

  -- Lower Body - Glutes
  ('Glute Bridge', array['weighted glute bridge'], 'glutes', 'hinge', 'bodyweight'),
  ('Cable Glute Kickback', array['cable kickback', 'glute kickback'], 'glutes', 'hinge', 'cable'),

  -- Lower Body - Calves
  ('Standing Calf Raise', array['calf raise', 'standing calf raise machine'], 'calves', 'legs', 'machine'),
  ('Seated Calf Raise', array['seated calf raise machine'], 'calves', 'legs', 'machine'),
  ('Single Leg Calf Raise', array['single leg calf raise', 'unilateral calf raise'], 'calves', 'legs', 'bodyweight'),

  -- Core
  ('Cable Crunch', array['cable abdominal crunch', 'kneeling cable crunch'], 'abs', 'core', 'cable'),
  ('Hanging Knee Raise', array['hanging leg raise', 'knee raise'], 'abs', 'core', 'bodyweight'),
  ('Dead Bug', array['dead bug exercise'], 'core', 'core', 'bodyweight'),
  ('Pallof Press', array['pallof', 'cable pallof press'], 'core', 'core', 'cable')
) as v(name, aliases, primary_muscle, category, equipment)
where not exists (
  select 1 from exercise_definitions ed where ed.name = v.name
);

-- ─────────────────────────────────────────────────────────
-- Repoint any already-logged exercises/templates from the old generic
-- names onto their new equivalents before the old rows are deleted.
-- 'Lunge' -> 'Walking Lunge', 'Leg Curl' -> 'Lying Leg Curl', and
-- 'Calf Raise' -> 'Standing Calf Raise' are best-guess picks since the
-- old entry covered variants the new list split in two — reassign
-- manually afterward if a given logged set was actually the other
-- variant (e.g. Reverse Lunge / Seated Leg Curl / Seated Calf Raise).
-- ─────────────────────────────────────────────────────────
do $$
declare
  m record;
  old_id uuid;
  new_id uuid;
begin
  for m in select * from (values
    ('Push Up', 'Push-Up'),
    ('Pull Up', 'Pull-Up'),
    ('Chin Up', 'Chin-Up'),
    ('Overhead Press', 'Barbell Overhead Press'),
    ('Lateral Raise', 'Dumbbell Lateral Raise'),
    ('Tricep Pushdown', 'Cable Triceps Pushdown'),
    ('Skull Crusher', 'EZ Bar Skull Crusher'),
    ('Bicep Curl', 'Dumbbell Biceps Curl'),
    ('Barbell Curl', 'EZ Bar Curl'),
    ('Lunge', 'Walking Lunge'),
    ('Leg Curl', 'Lying Leg Curl'),
    ('Calf Raise', 'Standing Calf Raise')
  ) as t(old_name, new_name)
  loop
    select id into old_id from exercise_definitions where name = m.old_name;
    select id into new_id from exercise_definitions where name = m.new_name;
    if old_id is not null and new_id is not null then
      update exercises set exercise_db_id = new_id where exercise_db_id = old_id;
      update template_exercises set exercise_db_id = new_id where exercise_db_id = old_id;
    end if;
  end loop;
end $$;

-- ─────────────────────────────────────────────────────────
-- Retire old generic names now superseded by the more specific
-- equipment-tagged entries added above (same lift, same equipment).
-- ─────────────────────────────────────────────────────────
delete from exercise_definitions where name in (
  'Push Up',
  'Pull Up',
  'Chin Up',
  'Overhead Press',
  'Lateral Raise',
  'Tricep Pushdown',
  'Skull Crusher',
  'Bicep Curl',
  'Barbell Curl',
  'Lunge',
  'Leg Curl',
  'Calf Raise'
);

-- ─────────────────────────────────────────────────────────
-- Update entries whose name already existed above, so the aliases /
-- category reflect the newer data instead of the original seed.
-- ─────────────────────────────────────────────────────────
update exercise_definitions set aliases = array['dumbbell press', 'flat dumbbell press', 'db bench']
  where name = 'Dumbbell Bench Press';
update exercise_definitions set aliases = array['incline db press', 'incline dumbbell bench']
  where name = 'Incline Dumbbell Press';
update exercise_definitions set aliases = array['lat pull down', 'pulldown', 'wide grip pulldown']
  where name = 'Lat Pulldown';
update exercise_definitions set aliases = array['db shoulder press', 'dumbbell overhead press']
  where name = 'Dumbbell Shoulder Press';
update exercise_definitions set primary_muscle = 'rear delts', aliases = array['cable face pull', 'rope face pull']
  where name = 'Face Pull';
update exercise_definitions set aliases = array['dumbbell hammer curl', 'neutral grip curl']
  where name = 'Hammer Curl';
update exercise_definitions set aliases = array['leg press machine', '45 degree leg press']
  where name = 'Leg Press';
update exercise_definitions set aliases = array['leg extension machine', 'quad extension']
  where name = 'Leg Extension';
update exercise_definitions set category = 'hinge', aliases = array['rdl', 'romanian deadlift', 'stiff leg deadlift']
  where name = 'Romanian Deadlift';
update exercise_definitions set category = 'hinge', aliases = array['barbell hip thrust', 'hip thrust machine']
  where name = 'Hip Thrust';
update exercise_definitions set aliases = array['front plank', 'abdominal plank']
  where name = 'Plank';
