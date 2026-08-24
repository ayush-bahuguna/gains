# Gains — Workout Journal

A digital workout notebook, not a fitness tracker. Voice-first logging, no chatbot framing — see `docs/workout-journal-build-spec.md` for the full product vision and screen-by-screen spec.

Built with Vite + React 19 + TypeScript, Tailwind CSS v4, and Supabase (Postgres + Auth + Row Level Security) as the only backend. The hand-drawn "notebook" look is rendered live with [rough.js](https://roughjs.com/), not static assets.

## Getting started

```
npm install
npm run dev
```

1. Copy `.env.example` to `.env.local` and fill in `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (and optionally `VITE_GIPHY_API_KEY` for the post-workout motivation GIF).
2. Follow `supabase/README.md` to create the Supabase project, run `supabase/schema.sql`, seed exercise/template data, and set up Google OAuth — the app only supports signing in with Google.

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check (`tsc -b`) and produce a production build |
| `npm run lint` | Run oxlint |
| `npm run format` | Format the repo with Prettier |
| `npm run preview` | Serve the production build locally |

There's no test suite — `npm run build` and `npm run lint` are the verification steps to run before committing.

## Project layout

- `src/screens/` — routed pages (Journal, Templates, History, Me, active/summary session views)
- `src/screens/dev/` — isolated, unauthenticated `/_dev/*` screens for building/QA-ing one component at a time with mock data (see `CLAUDE.md`)
- `src/components/` — shared UI, including the `Sketchy` rough.js wrapper everything else is built on
- `src/lib/` — Supabase client, date helpers, voice parsing/recognition, misc utilities
- `supabase/` — hand-maintained schema and seed SQL (no migration tooling — see `supabase/README.md`)
- `docs/` — product/design spec

For architecture notes, established conventions, and known gotchas (the kind of thing that takes a while to rediscover from scratch), see `CLAUDE.md`.
