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

> **Revision note:** this section was rewritten to match a second, more detailed reference image supplied after the first build attempt — it supersedes the original hand-drawn-ink-sketch direction (old palette `#FAF6EF`/`#222222`/`#507A5A`, single-font). The new direction keeps this reference's layout/shape vocabulary and palette, but rendering ended up going back to genuine hand-drawn pen-stroke borders (via rough.js) rather than the clean straight-edged borders originally shown in that reference — see §4.3.

### 4.1 Typography
**Two font families**, not one — a decorative display face for headers, a handwritten face for body/data text. Both are single-weight (400) fonts; the root font size is bumped to 19px (from the 16px default) since these scripts render visually smaller than Caveat/Kalam did at the same declared size.

| Style | Font |
|---|---|
| Header 1 / 2 / Section Title | Gloria Hallelujah, 400 |
| Body Large / Body / Caption | Covered By Your Grace, 400 |

Landed here after live-comparing several handwritten Google Fonts pairs during Phase 4 (Caveat/Kalam → Shadows Into Light/Nanum Pen Script → Shadows Into Light/Reenie Beanie → Gloria Hallelujah/Reenie Beanie → final).

### 4.2 Color Palette

| Token | Hex | Use |
|---|---|---|
| Paper | `#F7F4EC` | Main background |
| Ink | `#1E1E1E` | Primary text, primary button fill, selected/active state |
| Graphite | `#5C5C5C` | Secondary/metadata text |
| Sage | `#B7C9B1` | Category chip fill (e.g. Chest), session progress bar |
| Sky | `#A8D5E2` | Category chip fill (e.g. Back), exercise progress bar |
| Sun | `#FFD166` | Category chip fill (e.g. Legs), warning toast background |
| Coral | `#FF887A` | Error toast background, destructive accents |
| Lavender | `#DDB7F8` | Category chip fill (e.g. Shoulders) |
| Highlight | `#FFF4A3` | Callout/highlight accents |

There is no single "accent" color the way earlier drafts had a signature green — ink-black is the primary/selected-state color throughout (filled buttons, active filter chips), and the pastel set (Sage/Sky/Sun/Coral/Lavender) is used for category chips and toast severity backgrounds.

### 4.3 Borders & Shapes
- Genuine hand-drawn pen-stroke borders (rendered with rough.js), not flat CSS borders — every outline has real wobble/roughness, scaled down for small elements (checkboxes, icon boxes) so they don't render as distorted blobs, and scaled up for large elements (cards) so the wobble reads clearly. Filled shapes use a flat solid fill underneath the sketchy outline; progress-bar fills and similar use rough.js's hachure fill style for a "colored with a crayon" texture instead of a flat rectangle.
- Shape vocabulary: fully-rounded pill (buttons, chips, filters), rounded-rectangle with a generous fixed radius (cards, inputs, toasts), rounded-square (icon boxes), circle/ellipse (avatars, mic button, radio dots, pagination dots)
- No taped-photo or tape-corner decoration anywhere in this revision

### 4.4 Components
- **Buttons**: primary = solid ink-black fill, white text, fully rounded pill; secondary = paper background, thin ink outline, fully rounded pill; tertiary = text-only link with chevron, no border; icon button = rounded-square outline containing a single icon
- **Inputs**: text input, search input (leading icon), number stepper (`− [value] +`), dropdown (value + chevron) — all rounded-rect, thin solid border
- **Chips/Tags**: category chips = solid pastel fill (Sage/Sky/Sun/Lavender), no border; type chips = outlined, paper background; filter chips = filled ink-black when selected, outlined when not
- **Cards**: icon box (rounded-square, small icon) + title + subtitle + metadata + trailing chevron, thin border, rounded-rect, no rotation/tape
- **Exercise card**: title + overflow menu (•••) at top, nested Set/Weight/Reps/✓ table, "+ Add set" action (see §3.2)
- **Tables**: Set / Weight / Reps / ✓ columns; checkbox per row indicates completed vs. pending
- **Navigation**: bottom tab bar, 4 items (Log, Templates, History, Me), simple outline icons with labels
- **Progress indicators**: labeled horizontal progress bar (rounded track), e.g. "4/6 exercises", "3/5 sets" — Sage fill for session progress, Sky fill for exercise progress
- **Checkboxes / toggles**: checkbox = rounded-square, ink check when checked; toggle switch = pill track, filled when on
- **Radio buttons**: circle outline, filled ink dot when selected
- **Slider**: hand-drawn track line with a custom sketchy circular ink handle overlaid on an invisible native range input (used for weight/reps quick-entry)
- **Pagination dots**: tiny hand-drawn ink blobs, filled ink = active, faint ink = inactive
- **Feedback**: toast/alert banners — success (Sage bg), warning (Sun bg), error (Coral bg), each with an icon, message, and close (×); bottom sheet and modal used sparingly (e.g. delete confirmation)
- **Empty states**: icon in a rounded-square box + heading + subtext + primary CTA button
- **Icons**: simple outlined illustrations, consistent stroke weight, no Material-style icons. Set: notebook/log, dumbbell, calendar, clock/history, trending-up/chart, star, pencil, trash, more (•••), chevron-left/right, check-circle, plus-circle, x-circle, person, settings/gear, mic, search

### 4.5 Mic / Voice Listening State
A dedicated listening panel: "Listening..." label, an audio waveform visualization (vertical bars), a circular filled ink mic button, "Tap to stop" helper text. Mic button states: Idle → Listening (active) → Processing → Error. No confirmation step between states unless an error occurs.

### 4.6 Motion
Subtle, natural, quick transitions (150–250ms), gentle easing. Never flashy. Used for: button press feedback, waveform animation while listening, row updates from voice input.

### 4.7 Imagery
No taped-photograph styling in this revision. Exercise cards use a plain icon box (dumbbell icon) rather than an illustrated photo placeholder. Real reference images/animations can be introduced later without changing this structure.

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
