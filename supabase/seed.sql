-- Run this after schema.sql
-- Seeds the default exercise library

INSERT INTO exercises (name, muscle, equipment, category, is_default) VALUES
  ('Bench Press',       'Chest',      'Barbell',    'Chest',     true),
  ('Incline DB Press',  'Chest',      'Dumbbells',  'Chest',     true),
  ('Cable Fly',         'Chest',      'Cable',      'Chest',     true),
  ('Overhead Press',    'Shoulders',  'Barbell',    'Shoulders', true),
  ('Lateral Raise',     'Shoulders',  'Dumbbells',  'Shoulders', true),
  ('Squat',             'Quads',      'Barbell',    'Legs',      true),
  ('Romanian DL',       'Hamstrings', 'Barbell',    'Legs',      true),
  ('Leg Press',         'Quads',      'Machine',    'Legs',      true),
  ('Pull-up',           'Back',       'Bodyweight', 'Back',      true),
  ('Barbell Row',       'Back',       'Barbell',    'Back',      true),
  ('Lat Pulldown',      'Back',       'Cable',      'Back',      true),
  ('Bicep Curl',        'Biceps',     'Dumbbells',  'Arms',      true),
  ('Tricep Pushdown',   'Triceps',    'Cable',      'Arms',      true),
  ('Dip',               'Triceps',    'Bodyweight', 'Arms',      true),
  ('Deadlift',          'Back',       'Barbell',    'Back',      true),
  ('Incline Press',     'Chest',      'Barbell',    'Chest',     true),
  ('Seated Row',        'Back',       'Cable',      'Back',      true),
  ('Bicep Curl',        'Biceps',     'Dumbbells',  'Arms',      true),
  ('Hammer Curl',       'Biceps',     'Dumbbells',  'Arms',      true),
  ('Skullcrusher',      'Triceps',    'Barbell',    'Arms',      true),
  ('Romanian Deadlift', 'Hamstrings', 'Barbell',    'Legs',      true),
  ('Face Pull',         'Rear Delt',  'Cable',      'Shoulders', true)
ON CONFLICT DO NOTHING;
