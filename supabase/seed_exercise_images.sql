-- Gains — exercise placeholder images, sourced from RepDB/exercise-dataset
-- (https://github.com/RepDB/exercise-dataset), free-tier flat illustrations.
-- Run after schema.sql (needs the placeholder_image_url_peak column).
-- Safe to re-run: every statement is a plain update keyed by exercise name.
--
-- License requires visible attribution: "Exercise data by RepDB (repdb.co)"
-- as a working link — added to the Me screen footer (src/screens/Me.tsx).
--
-- 69 of our 81 exercises have a matching RepDB illustration; the other 12
-- are not in RepDB's free 250-exercise set and are intentionally left null:
--   Incline Machine Chest Press, Machine Row, Reverse Pec Deck,
--   Cable Rear Delt Fly, Rope Triceps Pushdown,
--   Single Arm Cable Triceps Extension, Smith Machine Squat, Step-Up,
--   Seated Leg Curl, Single Leg Curl, Cable Leg Curl, Pallof Press

-- Original core list (block 1 survivors)
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/bench-press-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/bench-press-peak.webp'
  where name = 'Bench Press';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/incline-bench-press-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/incline-bench-press-peak.webp'
  where name = 'Incline Bench Press';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/db-bench-press-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/db-bench-press-peak.webp'
  where name = 'Dumbbell Bench Press';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/incline-db-press-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/incline-db-press-peak.webp'
  where name = 'Incline Dumbbell Press';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/cable-fly-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/cable-fly-peak.webp'
  where name = 'Chest Fly';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/deadlift-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/deadlift-peak.webp'
  where name = 'Deadlift';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/romanian-deadlift-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/romanian-deadlift-peak.webp'
  where name = 'Romanian Deadlift';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/barbell-row-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/barbell-row-peak.webp'
  where name = 'Barbell Row';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/single-arm-db-row-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/single-arm-db-row-peak.webp'
  where name = 'Dumbbell Row';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/lat-pulldown-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/lat-pulldown-peak.webp'
  where name = 'Lat Pulldown';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/wide-grip-seated-cable-row-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/wide-grip-seated-cable-row-peak.webp'
  where name = 'Seated Cable Row';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/hammer-curl-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/hammer-curl-peak.webp'
  where name = 'Hammer Curl';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/squat-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/squat-peak.webp'
  where name = 'Squat';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/front-squat-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/front-squat-peak.webp'
  where name = 'Front Squat';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/leg-press-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/leg-press-peak.webp'
  where name = 'Leg Press';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/leg-extension-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/leg-extension-peak.webp'
  where name = 'Leg Extension';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/hip-thrust-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/hip-thrust-peak.webp'
  where name = 'Hip Thrust';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/plank-main.webp', placeholder_image_url_peak = null
  where name = 'Plank';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/crunches-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/crunches-peak.webp'
  where name = 'Crunch';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/hanging-leg-raise-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/hanging-leg-raise-peak.webp'
  where name = 'Hanging Leg Raise';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/russian-twist-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/russian-twist-peak.webp'
  where name = 'Russian Twist';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/face-pull-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/face-pull-peak.webp'
  where name = 'Face Pull';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/shrug-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/shrug-peak.webp'
  where name = 'Shrug';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/kettlebell-farmers-walk-main.webp', placeholder_image_url_peak = null
  where name = 'Farmer Carry';
-- Upper Body - Chest
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/incline-bench-press-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/incline-bench-press-peak.webp'
  where name = 'Incline Barbell Bench Press';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/chest-press-machine-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/chest-press-machine-peak.webp'
  where name = 'Machine Chest Press';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/cable-fly-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/cable-fly-peak.webp'
  where name = 'Cable Chest Fly';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/machine-chest-fly-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/machine-chest-fly-peak.webp'
  where name = 'Pec Deck';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/push-up-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/push-up-peak.webp'
  where name = 'Push-Up';
-- Upper Body - Back
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/lat-pulldown-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/lat-pulldown-peak.webp'
  where name = 'Neutral Grip Lat Pulldown';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/close-grip-lat-pulldown-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/close-grip-lat-pulldown-peak.webp'
  where name = 'Close Grip Lat Pulldown';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/assisted-pull-ups-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/assisted-pull-ups-peak.webp'
  where name = 'Assisted Pull-Up';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/pull-up-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/pull-up-peak.webp'
  where name = 'Pull-Up';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/chin-ups-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/chin-ups-peak.webp'
  where name = 'Chin-Up';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/cable-bent-over-row-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/cable-bent-over-row-peak.webp'
  where name = 'Single Arm Cable Row';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/chest-supported-db-row-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/chest-supported-db-row-peak.webp'
  where name = 'Chest Supported Row';
-- Shoulders
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/machine-shoulder-press-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/machine-shoulder-press-peak.webp'
  where name = 'Machine Shoulder Press';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/ohp-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/ohp-peak.webp'
  where name = 'Barbell Overhead Press';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/arnold-press-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/arnold-press-peak.webp'
  where name = 'Arnold Press';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/lateral-raise-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/lateral-raise-peak.webp'
  where name = 'Dumbbell Lateral Raise';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/cable-lateral-raise-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/cable-lateral-raise-peak.webp'
  where name = 'Cable Lateral Raise';
-- Arms - Triceps
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/tricep-pushdown-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/tricep-pushdown-peak.webp'
  where name = 'Cable Triceps Pushdown';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/overhead-tricep-extension-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/overhead-tricep-extension-peak.webp'
  where name = 'Overhead Cable Triceps Extension';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/dumbbell-tricep-extension-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/dumbbell-tricep-extension-peak.webp'
  where name = 'Dumbbell Skull Crusher';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/skull-crusher-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/skull-crusher-peak.webp'
  where name = 'EZ Bar Skull Crusher';
-- Arms - Biceps
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/bicep-curl-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/bicep-curl-peak.webp'
  where name = 'Dumbbell Biceps Curl';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/incline-db-curl-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/incline-db-curl-peak.webp'
  where name = 'Incline Dumbbell Curl';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/preacher-curl-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/preacher-curl-peak.webp'
  where name = 'Preacher Curl';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/ez-bar-curl-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/ez-bar-curl-peak.webp'
  where name = 'EZ Bar Curl';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/cable-curl-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/cable-curl-peak.webp'
  where name = 'Cable Biceps Curl';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/reverse-curl-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/reverse-curl-peak.webp'
  where name = 'Reverse Curl';
-- Shoulders / Arms — remaining originals
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/dumbbell-front-raise-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/dumbbell-front-raise-peak.webp'
  where name = 'Front Raise';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/rear-delt-fly-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/rear-delt-fly-peak.webp'
  where name = 'Rear Delt Fly';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/dips-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/dips-peak.webp'
  where name = 'Tricep Dip';
-- Lower Body - Quads
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/hack-squat-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/hack-squat-peak.webp'
  where name = 'Hack Squat';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/goblet-squat-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/goblet-squat-peak.webp'
  where name = 'Goblet Squat';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/bulgarian-split-squat-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/bulgarian-split-squat-peak.webp'
  where name = 'Bulgarian Split Squat';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/reverse-lunge-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/reverse-lunge-peak.webp'
  where name = 'Reverse Lunge';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/db-lunge-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/db-lunge-peak.webp'
  where name = 'Walking Lunge';
-- Lower Body - Hamstrings
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/leg-curl-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/leg-curl-peak.webp'
  where name = 'Lying Leg Curl';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/dumbbell-romanian-deadlift-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/dumbbell-romanian-deadlift-peak.webp'
  where name = 'Dumbbell Romanian Deadlift';
-- Lower Body - Glutes
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/glute-bridge-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/glute-bridge-peak.webp'
  where name = 'Glute Bridge';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/cable-kickback-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/cable-kickback-peak.webp'
  where name = 'Cable Glute Kickback';
-- Lower Body - Calves
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/machine-calf-raise-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/machine-calf-raise-peak.webp'
  where name = 'Standing Calf Raise';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/seated-calf-raise-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/seated-calf-raise-peak.webp'
  where name = 'Seated Calf Raise';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/bodyweight-calf-raise-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/bodyweight-calf-raise-peak.webp'
  where name = 'Single Leg Calf Raise';
-- Core
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/cable-crunch-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/cable-crunch-peak.webp'
  where name = 'Cable Crunch';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/hanging-knee-raise-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/hanging-knee-raise-peak.webp'
  where name = 'Hanging Knee Raise';
update exercise_definitions set placeholder_image_url = 'https://exercise-dataset.com/images/flat/dead-bug-start.webp', placeholder_image_url_peak = 'https://exercise-dataset.com/images/flat/dead-bug-peak.webp'
  where name = 'Dead Bug';
