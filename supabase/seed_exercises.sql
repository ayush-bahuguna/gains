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
