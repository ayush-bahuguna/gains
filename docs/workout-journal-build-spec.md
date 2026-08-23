# Workout Journal — Build Spec

**Purpose of this doc:** Everything needed to start building the app — product vision, design system, and screen-by-screen specs — consolidated for planning in Claude Code. Treat this as the source of truth; ask before deviating from it.

---

## 1. Product Vision

Workout Journal is **not a fitness tracker** — it's a **digital workout notebook**. The app should feel like carrying a small notebook to the gym, not like operating software.

**Core principles:**
- **Record, don't manage.** The app exists to record workouts with the least possible effort. Everything else is secondary.
- **The workout comes first.** The app never interrupts the workout and requires minimal attention while exercising.
- **Voice first.** Speaking is the primary input method; typing is always optional. A user should be able to say "Bench press eighty for eight" and have it parsed, matched to the exercise database, and logged — no follow-up questions.
- **AI is invisible.** No chatbot, no assistant persona, no prompts. The notebook just understands what the user meant.

---

## 2. Information Architecture

Four sections only, in persistent bottom navigation. No hamburger menu, no hidden navigation, no deep hierarchies.

```
Journal    — home / active session / session summary
Templates  — reusable workout starting points
History    — archive of completed sessions
Me         — account only (login/logout, no settings page in V1)
```

---

## 3. Screen Specs

### 3.1 Journal — Home (no active session)

- Header: app name + tagline ("Your notebook. Your progress."), small notebook illustration
- Greeting card (taped notebook card): "Good morning, {name}", current date, subtext ("Ready to get stronger today?")
- Primary CTA: **Start Session** (full-width, filled accent green)
- Secondary: **Resume Last Session** (outlined), shows last session name/date/duration if one was left unfinished
- **Recent Templates**: horizontal row of template cards (icon, name, exercise count), "View all" link to Templates tab
- **Recent Sessions**: list rows (name, date, duration, exercise count, chevron), "View all" link to History tab
- Bottom nav: Journal (active), Templates, History, Me

Starting a session: 1 tap, no confirmation screen. Auto-records date + start time, navigates straight to Active Session.

### 3.2 Journal — Active Session

The most important screen in the app. Users spend nearly all their time here.

**Header**
- Back arrow, session name (editable inline, pencil icon), **Finish** action (top right, green)
- Metadata row: date · start time · live elapsed timer

**Exercise search**
- Search bar directly below header, inline mic icon
- Instant search by exercise name or alias — no categories, no browsing
- Selecting a result immediately inserts an exercise card into the session
- Helper text when empty: "Search to add an exercise"

**Exercise card** (one per added exercise)
- Taped Polaroid-style placeholder image, top-left
- Exercise name (large), overflow menu (`•••`) for rename/delete/reorder
- Set table: columns = Set, Weight (kg), Reps
- **+ Add Set** button (outlined, bottom-left of card)
- Inline mic button (bottom-right of card, circular outline)

**Session notes**
- Free-text notebook-style area, pencil icon, dashed/ruled-line styling
- Example placeholder content: "Felt strong today. Increase bench press next week."

**Voice**
- Floating mic button, bottom-center, persistent across the session (states: idle / listening / processing / error — see §4.5)
- Natural language commands update the notebook immediately, no confirmation dialogs (see §5 Voice Grammar)

**Bottom nav** present throughout (Journal tab active/highlighted)

**Finish Session**: 1 tap → auto-records end time + duration → navigates directly to Session Summary, no confirmation.

### 3.3 Journal — Session Summary ("Session Completed")

Shown immediately after Finish Session; becomes the permanent record (same layout reused in History → Session Details).

- Back arrow, title "Session Completed" (with star icon), **Edit Session** link (top right)
- Subtext: "Great work, {name}!"
- Summary card (taped): session name (editable), date, started time, finished time, duration (highlighted in accent green), exercise thumbnail
- **Stat cards** (4-up grid): Exercises, Total Sets, Total Volume (kg), Personal Records
- **Exercise Summary**: numbered list, each with thumbnail, name, full set table, overflow menu, and (if applicable) a **PR badge** + estimated 1RM
- **Session Notes**: read-only display of notes taken during the session, editable
- Actions (bottom, sticky): **Done** (outlined) and **Repeat This Workout** (filled green, with repeat icon)

> Note: "Resume Last Session," PR badges, and estimated 1RM are additions beyond the original PRD text — confirmed as intentional V1 scope by the design mockups. Flag if you want these formally added to product requirements.

### 3.4 Templates *(from PRD — not yet mocked)*
- Template List: simple list, name + exercise count (e.g. Push, Pull, Legs, Upper, Lower)
- Template Details: name + exercise list preview, **Start Session** action — copies exercises into a new session; user may freely add/remove/reorder afterward (templates never lock the workout)

### 3.5 History *(from PRD — not yet mocked)*
- Header with date filter: All Sessions / Last Week / Last Month / Custom Range
- Session List: rows with name, date, duration, exercise count → opens Session Details
- Session Details: reuses the Session Summary layout, plus actions: Repeat Workout, Duplicate, Delete

### 3.6 Me *(from PRD — not yet mocked)*
- Minimal: Login / Logout only. No settings, no export, no exercise management in V1.

---

## 4. Design System

### 4.1 Typography
Single font family: **Caveat** (handwritten style) for everything. Hierarchy comes from size/weight/spacing only — never introduce a second font family.

| Style | Size / Weight |
|---|---|
| Page Title | Caveat Bold, 32–40px |
| Section Title | Caveat Bold, 24–32px |
| Exercise Name | Caveat Medium, 20px |
| Body Text | Caveat Regular, 18–28px |
| Metadata / small notes | Caveat Regular, 16–24px |

### 4.2 Color Palette

| Token | Hex | Use |
|---|---|---|
| Primary Paper | `#FAF6EF` | Main background |
| Secondary Paper | `#F3EBDD` | Card / section background |
| Notebook Line | `#DDD3C4` | Dividers, ruled lines |
| Accent Green | `#507A5A` | Primary actions, active states, links |
| Primary Ink | `#222222` | Primary text |
| Secondary Ink | `#555555` | Secondary/metadata text |
| Error Red | `#B55454` | Errors, destructive actions |

### 4.3 Borders & Shapes
- Every component: hand-drawn outline, slight imperfections, uneven line thickness, organic curves — nothing mathematically perfect
- Shape vocabulary: rectangle, dashed rectangle, rounded rectangle, circle, pill, organic/blob
- Dividers: hand-drawn horizontal lines (solid or dotted)
- Tags/labels: small pill/tag shapes with a "taped" corner accent

### 4.4 Components
- **Buttons**: outlined, rounded, hand-drawn stroke. States: default, pressed (darker fill), disabled (faded). Primary = filled accent green; secondary = outlined
- **Floating Action Button**: circular, accent green, used for the mic
- **Icon buttons**: circular outline, single icon (add, delete/trash, edit/pencil)
- **Inputs**: search bar (icon + placeholder + trailing mic), outlined input, underlined input, notes textarea — all hand-drawn borders
- **Exercise card**: taped placeholder image + name + set table + Add Set + inline mic (see §3.2)
- **Tables**: Set / Weight / Reps columns; row states = default, editing, selected, completed (strikethrough/muted), voice-updated (highlighted transiently)
- **Navigation**: bottom tab bar, 4 items, active tab underlined in accent green
- **Cards & containers**: session summary card, template card, note/highlight card — outlined, minimal, some with a taped-corner accent
- **Checkboxes / radio buttons**: hand-drawn, states = unchecked/checked/disabled, selected/unselected/disabled
- **Feedback**: toast/notification (e.g. "✓ Set added"), bottom sheet (e.g. Add Exercise / Add Note / Delete Exercise), modal (used sparingly — e.g. delete confirmation only)
- **Icons**: simple outlined illustrations, consistent stroke weight, no Material-style icons. Set: dumbbell, notebook, microphone, stopwatch, pencil, checkmark, more (•••)

### 4.5 Mic / Voice Button States
Idle → Listening (active, pulsing ring) → Processing (dashed ring) → Error (red). No confirmation step between states unless an error occurs.

### 4.6 Motion
Subtle, natural, quick transitions (150–250ms), gentle easing. Never flashy. Used for: button press feedback, mic pulsing, row updates from voice input.

### 4.7 Imagery
Exercise images are illustrated, styled as printed photographs "taped" onto the notebook page (visible tape corners, slight rotation). Placeholder illustrations in V1; can be swapped for real reference images/animations later.

---

## 5. Voice Command Grammar

The system must parse natural speech with no memorized command syntax required.

| Spoken | Interpreted as |
|---|---|
| "Bench press" | Create/select exercise |
| "Bench press eighty for eight" | Create exercise + first set (weight 80, reps 8) |
| "Eighty five for six" | Append a new set to the current exercise |
| "Same weight ten reps" | Duplicate previous set's weight, update reps |
| "Another set" | Duplicate the previous set row |
| "Increase five" | Increase previous set's weight by 5 |
| "Delete last set" | Remove the most recent set row |
| "Delete bench press" | Remove the exercise entirely |
| "Finish workout" | End the session |
| "Undo" | Reverse the previous voice-triggered action |

Implementation notes:
- Needs an exercise-name matcher against the database (name + aliases), fuzzy enough to handle "bench" → "Bench Press"
- Needs to track "current exercise" context (last one referenced) so commands like "another set" know which card to update
- Needs an undo stack, at minimum one level deep, ideally more

---

## 6. Backend, Database & Auth

- **Backend/DB: Supabase** (managed Postgres) — chosen over a custom Node/Express backend to avoid building and hosting a separate server for V1. Supabase provides:
  - Postgres database matching the relational structure below (sessions → exercises → sets)
  - Auto-generated REST/client API via `@supabase/supabase-js`, called directly from the React app
  - **Row Level Security (RLS)**: every table scoped to `auth.uid()` so users only ever see their own data
- **Auth: Google Sign-In via Supabase Auth** — Supabase handles the OAuth flow; the app just calls `supabase.auth.signInWithOAuth({ provider: 'google' })`. No custom session/token handling needed.
- All persisted data (sessions, exercises, sets, templates, notes) lives in Postgres, not on-device — the app is online-first for V1. Offline support is a possible future enhancement, not V1 scope.

## 7. Data Model

All tables below include a `user_id` (references `auth.users`) for Supabase Row Level Security — omitted from the field lists for brevity except where noted.

```
WorkoutSession
  - id
  - user_id
  - date
  - startTime
  - endTime
  - duration
  - name
  - exercises: Exercise[]
  - notes: string

Exercise (within a session)
  - id
  - exerciseDbId (ref to ExerciseDefinition)
  - name
  - imageUrl (placeholder or real)
  - sets: Set[]

Set
  - setNumber
  - weight
  - reps

Template
  - id
  - name
  - exercises: ExerciseDefinition[] (no sets — just the list)

ExerciseDefinition (database, internal — no direct browsing UI)
  - id
  - name
  - aliases: string[]
  - primaryMuscle
  - category
  - equipment
  - placeholderImageUrl
  - (future) instructions, animation, video
```

Derived/computed fields for Session Summary: total exercises, total sets, total volume (Σ weight × reps across all sets), personal records (per exercise, vs. historical max), estimated 1RM (e.g. Epley formula) per exercise.

---

## 8. Interaction Principles
- Start workout: 1 tap, no confirmation
- Add exercise: search → select, nothing else
- Record a set: voice, or direct table cell entry
- Finish workout: 1 tap, no confirmation
- Confirmations/modals reserved for destructive actions only (e.g. delete exercise)

---

## 9. Out of Scope for V1
Nutrition tracking, water tracking, wearables/smartwatch integration, Apple Health / Google Fit, social features (friends, challenges, messaging), AI workout coaching or workout generation, recovery tracking. Only reconsider if it doesn't compromise the notebook-first philosophy.

---

## 10. Tech Stack (decided)

Target: **mobile phone, browser only** — no native app, no desktop layout needed.

| Layer | Choice | Why |
|---|---|---|
| Frontend framework | Vite + React + TypeScript | Fast dev loop, no SSR overhead not needed for a mobile-only web app |
| Styling | Tailwind CSS | Pairs with custom design tokens (paper/ink/accent palette, hand-drawn border radii) |
| Installability | PWA (`vite-plugin-pwa`) | Add-to-home-screen, app-like feel without native build |
| State management | Zustand | Minimal boilerplate for active session state (timer, current exercise, etc.) |
| Backend / Database | Supabase (Postgres) | Managed relational DB matching the session/exercise/set structure; no custom server to build for V1 |
| Auth | Supabase Auth (Google provider) | Handles OAuth flow, session tokens, and ties directly into Postgres RLS |
| Voice input | Web Speech API (`SpeechRecognition`) | Built into mobile browsers, no external service needed to start |

## 11. Open Questions for Planning in Claude Code
- Voice parsing: browser `SpeechRecognition` gets raw text — still need to decide how the *parsing* of that text into structured commands (§5) happens: simple rule-based/regex parsing vs. sending the transcript to an LLM (e.g. Claude API) for interpretation. Rule-based is cheaper/faster; LLM-based handles more natural phrasing variance.
- Whether "Resume Last Session," PR badges, and 1RM estimates (present in mockups, absent from original PRD text) should be formally added to product requirements.
- Templates, History, and Me screens have PRD text but no visual mockups yet — may need design passes before/during build.
- Supabase project setup (schema migrations, RLS policies, Google OAuth credentials in Google Cloud Console) needs to happen before frontend work can hit a real backend — worth doing as step one in Claude Code.
