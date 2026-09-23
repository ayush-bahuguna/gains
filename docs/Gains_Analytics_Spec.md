# Gains — Analytics Feature Specification

## Goal

Build a simple, meaningful Analytics page for Gains that helps the user understand:

1. How consistently they train
2. Whether their exercises are improving
3. Which muscle groups they are actually training
4. How individual exercise strength is progressing over time
5. Recent personal records

The page should feel like a **progress journal**, not a fitness spreadsheet. Avoid clutter and metrics that do not provide meaningful insight.

---

## 1. Overview Tiles

At the top of the page, show three interactive tiles:

### Total Workouts / Sessions

Example:

**42**  
Workouts

Represents completed workout sessions in the selected time period.

Clicking the tile expands a detail section below the tiles.

### Improvements

Example:

**6 / 7**  
Exercises Improved

Represents the number of exercises that have shown measurable improvement during the selected period.

Clicking the tile expands a detail section showing which exercises improved and by how much.

Example:

| Exercise | Improvement |
|---|---:|
| Bench Press | +8.3% |
| Lat Pulldown | +6.7% |
| Leg Press | +12.5% |
| Machine Bicep Curl | +5.2% |
| Romanian Deadlift | +4.8% |
| Machine Shoulder Press | +3.1% |

Initially show approximately 6–7 exercises, with **View all →** to reveal the complete list.

### Improvement Calculation

The exact improvement algorithm needs to be designed carefully.

Do not simply compare the heaviest weight ever.

Example:

- June: 60 kg × 10
- September: 70 kg × 6

A raw weight comparison says +16.7%, but reps decreased, so this does not accurately represent strength improvement.

A possible underlying metric is estimated 1RM (e1RM), using the Epley formula:

`e1RM = weight × (1 + reps / 30)`

Example:

- 60 × 10 → 80 kg e1RM
- 70 × 6 → 84 kg e1RM
- Improvement → +5%

A potential approach:

- **Baseline:** best e1RM during the first 2–3 sessions where the exercise was performed
- **Current:** best e1RM during the selected period
- **Improvement %:** `(current e1RM - baseline e1RM) / baseline e1RM × 100`

This still needs further design before implementation.

Rules should eventually define:

- What counts as a working set
- Minimum / maximum valid rep ranges
- Whether warm-up sets are excluded
- How to handle exercises where e1RM is inappropriate
- How to handle long gaps between sessions
- How to handle changes in equipment or exercise variations

Do not implement the improvement algorithm blindly until these rules are finalized.

### Coverage

Example:

**7 / 8**  
Muscle Groups

Represents the number of tracked muscle groups that the user has actually trained during the selected period.

Clicking the tile expands a detailed coverage section.

Example:

| Muscle Group | Status | Exercises |
|---|---|---:|
| Chest | ✓ | 12 |
| Back | ✓ | 15 |
| Shoulders | ✓ | 8 |
| Arms | ✓ | 11 |
| Quads | ✓ | 9 |
| Hamstrings | ✓ | 6 |
| Glutes | ✓ | 7 |
| Core | ○ | 0 |

The number of exercises represents **distinct exercises performed**, not number of sets.

The user should be able to click a muscle group to see the exercises performed for that group.

Coverage is descriptive. It should not imply that a particular distribution is inherently good or bad.

---

## 2. Calendar Consistency

The existing workout consistency calendar should be moved to the Analytics page.

Place it near the top, after the overview tiles.

Example:

```text
             September

      M  T  W  T  F  S  S
      ·  ●  ·  ●  ·  ●  ·
      ·  ·  ●  ·  ·  ●  ·
      ●  ·  ·  ●  ·  ·  ·
      ·  ●  ·  ·  ●  ·  ●

42 workouts
```

Continue using the existing Gains calendar/consistency functionality.

Do not add a separate frequency metric to the overview. Total workouts and frequency represent essentially the same dimension.

---

## 3. Strength Progress

This should be the primary analytical visualization.

Provide an exercise selector:

`[ Bench Press ▼ ]`

Possible exercises include:

- Bench Press
- Incline Bench Press
- Dumbbell Bench Press
- Lat Pulldown
- Squat
- Romanian Deadlift
- etc.

The selected exercise displays a line graph showing strength progression over time.

Use **estimated 1RM (e1RM)** as the primary Y-axis metric where appropriate.

Important:

- Only plot dates where the selected exercise was actually performed.
- Do not interpolate through periods where the exercise was not performed.
- The graph should represent actual logged training data.
- The user can change the selected exercise.

---

## 4. Recent PRs

Place Recent PRs below the Strength Progress graph.

The PR list should be contextual to the selected exercise.

Example:

```text
RECENT PRs

70 kg × 8       Sep 21
67.5 kg × 9     Sep 12
65 kg × 10      Aug 30

Current Best
70 kg × 8
```

When the selected exercise changes, the PR list updates accordingly.

This avoids creating a separate large PR dashboard.

---

## 5. Expanded Improvements Section

The Improvements tile should expand/collapse its detail section.

Default view:

```text
IMPROVEMENTS

Bench Press                  +8.3%
Lat Pulldown                 +6.7%
Leg Press                   +12.5%
Machine Bicep Curl           +5.2%
Romanian Deadlift            +4.8%
Machine Shoulder Press       +3.1%

View all →
```

The percentage must use the finalized improvement algorithm.

---

## 6. Expanded Coverage Section

The Coverage tile should expand/collapse its detail section.

Example:

```text
TRAINING COVERAGE

Chest             ✓   12 exercises
Back              ✓   15 exercises
Shoulders         ✓    8 exercises
Arms              ✓   11 exercises
Quads             ✓    9 exercises
Hamstrings        ✓    6 exercises
Glutes            ✓    7 exercises
Core              ○    0 exercises
```

Allow a user to select a muscle group and inspect the exercises performed for that group.

Example:

```text
Back ✓

Lat Pulldown
Seated Cable Row
Chest Supported Row
Machine Row
Dumbbell Row
```

---

## 7. Recommended Page Hierarchy

```text
ANALYTICS

┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│ 42             │ │ 6 / 7          │ │ 7 / 8          │
│ Workouts       │ │ Improvements   │ │ Coverage       │
└────────────────┘ └────────────────┘ └────────────────┘

                CONSISTENCY

        [ Existing Calendar ]

                STRENGTH

        [ Bench Press ▼ ]

        ┌──────────────────────┐
        │                      │
        │    Line Graph        │
        │                      │
        └──────────────────────┘

                Recent PRs

        70 × 8       Sep 21
        67.5 × 9     Sep 12
        65 kg × 10   Aug 30


        IMPROVEMENTS
        ──────────────────────
        Bench Press       +8.3%
        Lat Pulldown      +6.7%
        ...


        COVERAGE
        ──────────────────────
        Chest             ✓ 12
        Back              ✓ 15
        ...
```

Improvements and Coverage should be **collapsed by default** and expanded only when their corresponding tile is clicked.

---

## Design Principles

### Keep Analytics focused

The page should answer:

- Am I training consistently?
- Am I getting stronger?
- What am I training?
- What have I achieved recently?

Avoid adding metrics just because they are available in the database.

### Do not use total training volume as a headline metric

Total volume (`weight × reps`) is highly dependent on the exercises performed and is not directly comparable across exercises.

Therefore total volume should not be one of the main overview tiles.

### Avoid redundant metrics

Do not show both:

- Total workouts
- Training frequency

as separate headline tiles.

They represent essentially the same dimension.

---

## Metrics intentionally excluded

At least for the initial Analytics version, avoid:

- Calories burned
- Average workout duration
- Exercise count as a general headline metric
- Generic workout intensity scores
- Readiness scores
- Recovery scores
- AI-generated fitness scores
- Daily volume graphs
- Too many PR categories
- Radar charts
- Excessive percentages
- Multiple competing date pickers
- A graph for every exercise on the main page

The Analytics page should feel like a **progress journal**, not a fitness spreadsheet.

---

## Final Concept

**Overview → Consistency → Strength → Detail on demand**

### Overview
- Total Workouts
- Improvements
- Coverage

### Consistency
- Existing workout calendar

### Strength
- Exercise selector
- Strength/e1RM trend
- Recent PRs

### Detail on demand
- Expanded Improvements
- Expanded Coverage

Every metric should have a distinct purpose and help the user understand their training rather than simply displaying more data.
