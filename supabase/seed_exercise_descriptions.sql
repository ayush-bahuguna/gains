-- Gains — exercise descriptions: how-to + muscles-targeted, one line each.
-- Run after schema.sql (needs the description column).
-- Safe to re-run: every statement is a plain update keyed by exercise name.

-- Upper Body - Chest
update exercise_definitions set description = 'Lower the bar to your chest with control, then press it upward while keeping your shoulder blades stable. Targets: Chest, with help from the triceps and front delts.'
  where name = 'Bench Press';
update exercise_definitions set description = 'Lower the bar toward your upper chest, then press it upward while keeping your body firmly supported on the bench. Targets: Upper chest, with help from the front delts and triceps.'
  where name = 'Incline Bench Press';
update exercise_definitions set description = 'Lower both dumbbells toward your chest with control, then press them upward without letting them drift too far apart. Targets: Chest, with help from the triceps and front delts.'
  where name = 'Dumbbell Bench Press';
update exercise_definitions set description = 'Lower the dumbbells toward your upper chest, then press them upward while keeping your shoulders controlled. Targets: Upper chest, with help from the front delts and triceps.'
  where name = 'Incline Dumbbell Press';
update exercise_definitions set description = 'Lower the bar toward your upper chest, then press it upward while keeping your upper back firmly against the bench. Targets: Upper chest, with help from the front delts and triceps.'
  where name = 'Incline Barbell Bench Press';
update exercise_definitions set description = 'Push the handles forward until your arms are nearly extended, then return them slowly. Targets: Chest, with help from the triceps and front delts.'
  where name = 'Machine Chest Press';
update exercise_definitions set description = 'Press the handles forward from an inclined position, then return them under control. Targets: Upper chest, with help from the front delts and triceps.'
  where name = 'Incline Machine Chest Press';
update exercise_definitions set description = 'Bring the cable handles together in front of your chest with slightly bent elbows, then slowly open your arms. Targets: Chest, particularly through the squeezing motion.'
  where name = 'Cable Chest Fly';
update exercise_definitions set description = 'Bring the weights together over your chest with slightly bent elbows, then lower them slowly. Targets: Chest, particularly the pectoral muscles.'
  where name = 'Chest Fly';
update exercise_definitions set description = 'Bring the machine pads together in front of your chest, then return them slowly without letting the weight pull you back. Targets: Chest.'
  where name = 'Pec Deck';
update exercise_definitions set description = 'Lower your body toward the floor while keeping your body straight, then push yourself back up. Targets: Chest, triceps and front delts.'
  where name = 'Push-Up';

-- Upper Body - Back
update exercise_definitions set description = 'Pull the bar toward your upper chest while keeping your torso controlled, then slowly extend your arms. Targets: Lats and upper back, with help from the biceps.'
  where name = 'Lat Pulldown';
update exercise_definitions set description = 'Pull the neutral-grip handles toward your upper chest while keeping your shoulders down, then return slowly. Targets: Lats and upper back, with help from the biceps.'
  where name = 'Neutral Grip Lat Pulldown';
update exercise_definitions set description = 'Pull the close-grip handle toward your upper chest while keeping your torso stable. Targets: Lats and mid-back, with significant biceps involvement.'
  where name = 'Close Grip Lat Pulldown';
update exercise_definitions set description = 'Pull your body upward until your chin clears the bar, then lower yourself under control. Targets: Lats and upper back, with help from the biceps.'
  where name = 'Pull-Up';
update exercise_definitions set description = 'Pull yourself upward using an underhand grip, then lower your body slowly. Targets: Lats and biceps, with help from the upper back.'
  where name = 'Chin-Up';
update exercise_definitions set description = 'Pull yourself upward using the assisted machine, then lower yourself slowly while maintaining control. Targets: Lats and upper back, with help from the biceps.'
  where name = 'Assisted Pull-Up';
update exercise_definitions set description = 'Pull the handle toward your torso while keeping your chest upright, then extend your arms under control. Targets: Mid-back and lats, with help from the biceps.'
  where name = 'Seated Cable Row';
update exercise_definitions set description = 'Pull the handle toward your hip while keeping your torso stable, then slowly extend your arm. Targets: Lats and mid-back, with help from the biceps.'
  where name = 'Single Arm Cable Row';
update exercise_definitions set description = 'Pull the handles or dumbbells toward your body while keeping your chest supported on the pad. Targets: Mid-back, lats and rear delts.'
  where name = 'Chest Supported Row';
update exercise_definitions set description = 'Pull the machine handles toward your torso while keeping your chest supported and shoulders controlled. Targets: Mid-back and lats, with help from the biceps.'
  where name = 'Machine Row';
update exercise_definitions set description = 'Hinge forward with a stable back, pull the bar toward your torso, then lower it under control. Targets: Lats, mid-back and rear delts, with help from the biceps.'
  where name = 'Barbell Row';
update exercise_definitions set description = 'Pull the dumbbell toward your hip while keeping your back stable, then lower it slowly. Targets: Lats and mid-back, with help from the biceps.'
  where name = 'Dumbbell Row';
update exercise_definitions set description = 'Lift the bar from the floor by driving through your feet while keeping the weight close to your body. Targets: Hamstrings, glutes, back and overall posterior chain.'
  where name = 'Deadlift';

-- Shoulders
update exercise_definitions set description = 'Press the dumbbells overhead without leaning excessively, then lower them slowly to shoulder level. Targets: Shoulders, especially the front and side delts, with help from the triceps.'
  where name = 'Dumbbell Shoulder Press';
update exercise_definitions set description = 'Press the machine handles overhead, then return them slowly while keeping your back supported. Targets: Shoulders, especially the front and side delts.'
  where name = 'Machine Shoulder Press';
update exercise_definitions set description = 'Press the bar overhead while keeping your core tight and body stable, then lower it under control. Targets: Shoulders and triceps, with help from the upper chest and core.'
  where name = 'Barbell Overhead Press';
update exercise_definitions set description = 'Start with your palms facing you, rotate them outward as you press overhead, then reverse the motion on the way down. Targets: Shoulders, particularly the front and side delts.'
  where name = 'Arnold Press';
update exercise_definitions set description = 'Raise the dumbbells out to your sides with slightly bent elbows, then lower them slowly. Targets: Side delts, helping build shoulder width.'
  where name = 'Dumbbell Lateral Raise';
update exercise_definitions set description = 'Raise the cable handle out to your side while keeping your torso still, then lower it slowly. Targets: Side delts.'
  where name = 'Cable Lateral Raise';
update exercise_definitions set description = 'Raise the dumbbells in front of you to around shoulder height, then lower them with control. Targets: Front delts.'
  where name = 'Front Raise';
update exercise_definitions set description = 'Raise the dumbbells out and back with slightly bent elbows while keeping your torso stable. Targets: Rear delts and upper back.'
  where name = 'Rear Delt Fly';
update exercise_definitions set description = 'Pull the machine handles or pads outward and backward, then return them slowly. Targets: Rear delts, with help from the upper back.'
  where name = 'Reverse Pec Deck';
update exercise_definitions set description = 'Pull the cables outward and backward using your rear shoulders while keeping your arms slightly bent. Targets: Rear delts and upper back.'
  where name = 'Cable Rear Delt Fly';
update exercise_definitions set description = 'Pull the rope toward your face while driving your elbows outward, then return slowly. Targets: Rear delts, upper back and external rotators.'
  where name = 'Face Pull';
update exercise_definitions set description = 'Raise your shoulders straight upward toward your ears, pause briefly, then lower them under control. Targets: Upper trapezius muscles.'
  where name = 'Shrug';

-- Arms - Triceps
update exercise_definitions set description = 'Push the cable handle downward while keeping your elbows close to your sides, then slowly return. Targets: Triceps.'
  where name = 'Cable Triceps Pushdown';
update exercise_definitions set description = 'Push the rope downward while keeping your elbows stationary, then return it under control. Targets: Triceps, particularly through full elbow extension.'
  where name = 'Rope Triceps Pushdown';
update exercise_definitions set description = 'Extend your arms overhead while keeping your elbows relatively fixed, then slowly bend them again. Targets: Triceps, especially the long head.'
  where name = 'Overhead Cable Triceps Extension';
update exercise_definitions set description = 'Extend one arm against the cable while keeping your upper arm stable, then return slowly. Targets: Triceps.'
  where name = 'Single Arm Cable Triceps Extension';
update exercise_definitions set description = 'Lower the dumbbells toward the sides of your head by bending your elbows, then extend your arms back up. Targets: Triceps, especially the long head.'
  where name = 'Dumbbell Skull Crusher';
update exercise_definitions set description = 'Lower the EZ bar toward your forehead or just behind your head, then extend your elbows to raise it. Targets: Triceps.'
  where name = 'EZ Bar Skull Crusher';
update exercise_definitions set description = 'Lower your body by bending your elbows, then press yourself back up while keeping your movement controlled. Targets: Triceps and chest.'
  where name = 'Tricep Dip';

-- Arms - Biceps
update exercise_definitions set description = 'Curl the dumbbells upward without swinging your body, then lower them slowly. Targets: Biceps.'
  where name = 'Dumbbell Biceps Curl';
update exercise_definitions set description = 'Curl the EZ bar toward your shoulders while keeping your elbows close to your sides, then lower it under control. Targets: Biceps and brachialis.'
  where name = 'EZ Bar Curl';
update exercise_definitions set description = 'Curl the dumbbells with your palms facing each other while keeping your elbows stable. Targets: Biceps and brachialis, with additional forearm involvement.'
  where name = 'Hammer Curl';
update exercise_definitions set description = 'Curl the dumbbells from an incline bench while keeping your upper arms behind your torso. Targets: Biceps, particularly the long head.'
  where name = 'Incline Dumbbell Curl';
update exercise_definitions set description = 'Curl the weight upward while keeping your upper arms supported against the preacher pad, then lower slowly. Targets: Biceps.'
  where name = 'Preacher Curl';
update exercise_definitions set description = 'Curl the cable handle toward your shoulders while keeping your elbows stable. Targets: Biceps.'
  where name = 'Cable Biceps Curl';
update exercise_definitions set description = 'Curl the bar with your palms facing downward while keeping your elbows close to your body. Targets: Brachialis, brachioradialis and forearms.'
  where name = 'Reverse Curl';

-- Lower Body - Quads
update exercise_definitions set description = 'Lower your hips by bending your knees and hips while keeping your torso controlled, then drive through your feet to stand. Targets: Quads and glutes, with significant core involvement.'
  where name = 'Squat';
update exercise_definitions set description = 'Squat with the bar positioned across your front shoulders while keeping your torso upright. Targets: Quads, with help from the glutes and core.'
  where name = 'Front Squat';
update exercise_definitions set description = 'Lower yourself into the machine squat while keeping your back supported, then drive through your feet to stand. Targets: Quads, with help from the glutes.'
  where name = 'Hack Squat';
update exercise_definitions set description = 'Lower your body under the guided bar while keeping your feet stable, then drive upward through your legs. Targets: Quads and glutes.'
  where name = 'Smith Machine Squat';
update exercise_definitions set description = 'Push the platform away with your feet while keeping your lower back supported against the pad. Targets: Quads, with help from the glutes and hamstrings.'
  where name = 'Leg Press';
update exercise_definitions set description = 'Hold a dumbbell close to your chest, squat down under control, then drive upward through your feet. Targets: Quads and glutes, with help from the core.'
  where name = 'Goblet Squat';
update exercise_definitions set description = 'Place your rear foot on a bench, lower your hips toward the floor, then drive through your front foot to stand. Targets: Quads and glutes, one leg at a time.'
  where name = 'Bulgarian Split Squat';
update exercise_definitions set description = 'Step backward, lower your body until your front leg is bent, then drive through the front foot to return. Targets: Quads and glutes.'
  where name = 'Reverse Lunge';
update exercise_definitions set description = 'Step forward into a lunge, push through your front foot, and continue into the next step. Targets: Quads and glutes, with additional balance and core demand.'
  where name = 'Walking Lunge';
update exercise_definitions set description = 'Step onto a raised platform using one leg, drive through that foot to stand, then step back down with control. Targets: Quads and glutes, with additional balance demand.'
  where name = 'Step-Up';
update exercise_definitions set description = 'Extend your knees against the machine resistance, pause briefly at the top, then lower the weight slowly. Targets: Quads.'
  where name = 'Leg Extension';

-- Lower Body - Hamstrings
update exercise_definitions set description = 'Curl your lower legs downward and back against the pad, then slowly return to the starting position. Targets: Hamstrings.'
  where name = 'Seated Leg Curl';
update exercise_definitions set description = 'Curl your heels toward your glutes while keeping your hips against the pad, then lower the weight slowly. Targets: Hamstrings.'
  where name = 'Lying Leg Curl';
update exercise_definitions set description = 'Curl one leg at a time toward your body while keeping your hips stable against the pad. Targets: Hamstrings, with each leg trained independently.'
  where name = 'Single Leg Curl';
update exercise_definitions set description = 'Curl your lower leg toward your glutes against the cable resistance while keeping your thigh stable. Targets: Hamstrings.'
  where name = 'Cable Leg Curl';
update exercise_definitions set description = 'Push your hips backward while lowering the weight along your legs, then drive your hips forward to stand. Targets: Hamstrings and glutes, with significant posterior-chain involvement.'
  where name = 'Romanian Deadlift';
update exercise_definitions set description = 'Lower the dumbbells along your legs by pushing your hips backward, then squeeze your glutes to return upright. Targets: Hamstrings and glutes.'
  where name = 'Dumbbell Romanian Deadlift';

-- Lower Body - Glutes
update exercise_definitions set description = 'Drive your hips upward while keeping your upper back supported, squeeze your glutes at the top, then lower slowly. Targets: Glutes, with help from the hamstrings.'
  where name = 'Hip Thrust';
update exercise_definitions set description = 'Drive your hips upward from the floor, squeeze your glutes at the top, then lower under control. Targets: Glutes, with help from the hamstrings.'
  where name = 'Glute Bridge';
update exercise_definitions set description = 'Drive one leg backward against the cable while keeping your torso stable, then return slowly. Targets: Glutes.'
  where name = 'Cable Glute Kickback';

-- Lower Body - Calves
update exercise_definitions set description = 'Push through the balls of your feet to raise your heels, pause briefly, then lower under control. Targets: Gastrocnemius and other calf muscles.'
  where name = 'Standing Calf Raise';
update exercise_definitions set description = 'Raise your heels while seated, pause at the top, then lower them slowly for a full stretch. Targets: Soleus and calf muscles.'
  where name = 'Seated Calf Raise';
update exercise_definitions set description = 'Raise one heel as high as possible while balancing on the other leg, then lower slowly. Targets: Calf muscles, one leg at a time.'
  where name = 'Single Leg Calf Raise';

-- Core
update exercise_definitions set description = 'Hold a straight-body position on your forearms or hands while keeping your core braced. Targets: Core, especially the deep abdominal and stabilizing muscles.'
  where name = 'Plank';
update exercise_definitions set description = 'Curl your upper body toward your pelvis while keeping the movement controlled, then return slowly. Targets: Abdominal muscles, particularly the rectus abdominis.'
  where name = 'Crunch';
update exercise_definitions set description = 'Brace your hips and curl your torso downward against the cable resistance, then return slowly. Targets: Abdominal muscles, particularly the rectus abdominis.'
  where name = 'Cable Crunch';
update exercise_definitions set description = 'Hang from a bar and bring your knees toward your chest without excessive swinging, then lower them slowly. Targets: Abs and hip flexors.'
  where name = 'Hanging Knee Raise';
update exercise_definitions set description = 'Hang from a bar and raise your legs while keeping the movement controlled, then lower them slowly. Targets: Abs and hip flexors.'
  where name = 'Hanging Leg Raise';
update exercise_definitions set description = 'Lie on your back and extend opposite arms and legs while keeping your lower back controlled against the floor. Targets: Deep core and abdominal stabilizers.'
  where name = 'Dead Bug';
update exercise_definitions set description = 'Press the cable handle straight away from your chest while resisting rotation, then bring it back under control. Targets: Core and obliques, particularly anti-rotation strength.'
  where name = 'Pallof Press';
update exercise_definitions set description = 'Rotate your torso from side to side while keeping your core braced and movement controlled. Targets: Obliques and abdominal muscles.'
  where name = 'Russian Twist';

-- Full Body
update exercise_definitions set description = 'Hold weights at your sides and walk with an upright posture while keeping your core braced. Targets: Grip, traps, core and overall full-body stability.'
  where name = 'Farmer Carry';
