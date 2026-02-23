# Supabase secrets → app and scripts

Your Supabase (or host) secrets use these names. Map them as follows.

## Secret names you have

| Secret name | Use for |
|-------------|---------|
| `SUPABASE_URL` | Project URL. Injected into Edge Functions by Supabase. |
| `SUPABASE_ANON_KEY` | Public anon key. |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (scripts, admin, functions). |
| `SUPABASE_DB_URL` | Direct DB connection (optional). |
| `RAPIDAPI_KEY` | Edge Functions (e.g. movie APIs). |
| `OMDB_API_KEY` | Edge Functions. |
| `TMDB_API_KEY` | Edge Functions. |
| `TMDB_ACCESS_TOKEN` | Edge Functions. |

## Frontend (Vite / www.cinemind.tech)

The app reads **only** from `import.meta.env`. Set these in your **host** (Vercel, Netlify, etc.) or in local `.env`:

| Host / .env variable | Set to |
|----------------------|--------|
| `VITE_SUPABASE_URL` | Same value as `SUPABASE_URL` (e.g. `https://vkeurtippyytdhyknqpx.supabase.co`) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Same value as `SUPABASE_ANON_KEY` |

Optional for scripts / deploy:

- `VITE_SUPABASE_PROJECT_ID` or `SUPABASE_PROJECT_REF` = project ref (e.g. `vkeurtippyytdhyknqpx`).
- `SUPABASE_SERVICE_ROLE_KEY` = same as the secret (for local scripts only; production functions get it from Supabase).

## Edge Functions

Supabase injects at deploy time:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Your functions already use `Deno.env.get('SUPABASE_URL')` and `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')`. No code change.

Other secrets (RAPIDAPI_KEY, OMDB_API_KEY, TMDB_*, etc.) are available as `Deno.env.get('RAPIDAPI_KEY')` etc. if you added them in Project Settings → Edge Functions → Secrets.

## Local `.env`

For local dev, copy from Supabase Dashboard → API (or from your secrets) into `.env`:

- `VITE_SUPABASE_URL` = project URL  
- `VITE_SUPABASE_PUBLISHABLE_KEY` = anon key (same as `SUPABASE_ANON_KEY`)  
- `SUPABASE_PROJECT_REF` = project ref  
- `SUPABASE_SERVICE_ROLE_KEY` = service role key (only if you run exec-sql, run-migration, apply-migrations)
