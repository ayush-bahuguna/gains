# Backend setup (Phase 1)

These steps are manual (browser + your accounts) — nothing here can be scripted from the CLI.

## 1. Create the Supabase project

1. Go to https://supabase.com/dashboard → **New project**
2. Name: `gains` (or anything), pick a region close to you, set a DB password (save it somewhere — not needed day-to-day, but you'll want it if you ever connect a raw Postgres client)
3. Wait for provisioning (~2 min)
4. Go to **Project Settings → Data API** and copy the **Project URL**
5. Go to **Project Settings → API Keys** and copy the **anon / public** key (not the `service_role` key — that one must never end up in frontend code or the repo)

Paste both back here and I'll wire up `.env.local`.

## 2. Run the schema

In the Supabase dashboard: **SQL Editor → New query**

1. Paste the contents of `supabase/schema.sql`, run it
2. Paste the contents of `supabase/seed_exercises.sql`, run it

Both are safe to re-run if you need to tweak and reapply.

## 3. Turn off email confirmation (dev convenience)

**Authentication → Providers → Email → Confirm email → off**

The app only uses Google Sign-In, but the RLS verification script (`scripts/verify-rls.mjs`) uses throwaway email/password accounts since Google's OAuth flow can't be scripted. Without this toggle off, those test accounts won't be able to sign in immediately.

## 4. Google OAuth

1. Go to https://console.cloud.google.com/ → create or select a project
2. **APIs & Services → OAuth consent screen** → External → fill in app name/support email → save
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID** → Application type: **Web application**
4. Under **Authorized redirect URIs**, add your Supabase callback URL:
   `https://<your-project-ref>.supabase.co/auth/v1/callback`
   (find `<your-project-ref>` in the Project URL from step 1 — it's the subdomain)
5. Copy the generated **Client ID** and **Client secret**
6. In Supabase: **Authentication → Providers → Google** → enable → paste Client ID + secret → save

## 5. Verify

Once `.env.local` is filled in:

```
node scripts/verify-rls.mjs
```

Should print `✅ RLS OK`.
