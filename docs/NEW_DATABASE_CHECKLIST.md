# Checklist: Creating a Completely New Database

Use this when you create a **new Supabase project** and want the app to use it from scratch.

---

## 1. Create the new Supabase project

- Go to [supabase.com](https://supabase.com) → **New project**.
- Pick org, name, region, and **set a database password** (save it).
- Wait for the project to be ready.

**You get:** Project URL, anon key, service role key, and database password (from the step above).

---

## 2. Apply the schema (migrations)

Two options:

### Option A – Supabase CLI (recommended)

```bash
cd /Users/ematik/Desktop/cine/holo-cine-memories
npx supabase login
npx supabase link --project-ref YOUR_NEW_PROJECT_REF
npx supabase db push
```

This runs all migrations in `supabase/migrations/` on the new DB.

### Option B – Run migrations manually

In the Supabase Dashboard → **SQL Editor**, run the contents of each migration file **in order** (oldest first by filename):

1. `20250919203439_*.sql` – profiles, movie_searches, user_preferences, favorites, RLS, triggers, `handle_new_user`
2. `20250924072114_*.sql` – user_query_analytics, RLS, indexes, admin view
3. `20250924072140_*.sql` – `get_admin_query_insights` function
4. `20250925024704_*.sql` – `auto_confirm_user` trigger
5. `20250925024741_*.sql` – (check file)
6. `20250925025030_*.sql` – (check file)
7. `20250925030000_create_password_reset_tokens.sql` – password_reset_tokens table

---

## 3. Update app config to use the new project

| Item | Where | What to set |
|------|--------|-------------|
| **Frontend** | `.env` | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PROJECT_ID`, `VITE_SUPABASE_PUBLISHABLE_KEY` from new project |
| **Frontend** | `src/integrations/supabase/client.ts` | Should read from `import.meta.env` (see below); then values come from `.env` |
| **Supabase config** | `supabase/config.toml` | `project_id = "YOUR_NEW_PROJECT_REF"` |
| **Auth hook** | `supabase/config.toml` | `[auth.hook.send_email]` → `uri` should point to **new** project URL if you deploy functions there |

**Dashboard:** Project Settings → API → Project URL, anon public key, project ref.  
**Dashboard:** Project Settings → Database → Database password (for `psql` / backups).

---

## 4. Edge Functions (optional but used by the app)

Functions use `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`; Supabase injects these when you deploy.

- Deploy to the **new** project:
  ```bash
  npx supabase link --project-ref YOUR_NEW_PROJECT_REF
  npx supabase functions deploy
  ```
- If you use the **send-auth-emails** hook, set the hook URL in the new project’s Auth settings to your new project’s function URL.

---

## 5. Admin analytics user (optional)

The `user_query_analytics` RLS policy has a hardcoded admin user ID. After your first admin user is created in the new DB:

- Get their user ID (e.g. from Auth → Users in Dashboard, or from `auth.users.id`).
- Run in SQL Editor:
  ```sql
  -- Replace OLD_ADMIN_ID with the UUID in the policy, and NEW_ADMIN_ID with your new user UUID
  -- File: supabase/migrations/20250924072114_48eda59f-a1af-4cbc-8a9a-517216b60b9c.sql
  -- Policy: "Service role can view all analytics"
  ```
  Or add a new migration that drops and recreates that policy with the new UUID.

---

## 6. What the new DB will have (no data from old DB)

- **Auth:** New users only; no existing users or sessions.
- **Tables:** profiles, movie_searches, user_preferences, favorites, user_query_analytics, password_reset_tokens (and any from other migrations).
- **RLS:** Same policies; users only see their own data.
- **Triggers:** New user → profile + user_preferences; auto-confirm email; updated_at.

---

## Summary: items you need

| # | Item | Where to get it |
|---|------|------------------|
| 1 | New Supabase project | supabase.com → New project |
| 2 | Project URL | Dashboard → Settings → API |
| 3 | Anon (publishable) key | Same |
| 4 | Service role key | Same (for functions; keep secret) |
| 5 | Project ref | In URL or Settings (e.g. `xxxxx.supabase.co` → `xxxxx`) |
| 6 | Database password | You set it when creating the project |

---

## Difficulty: **Easy**

- **~15–30 minutes** if you use the CLI (`supabase link` + `db push` + update `.env` and `client.ts`).
- **~30–45 minutes** if you run migrations by hand in the SQL Editor and then update config.
- No code logic changes required; only config and (optionally) one RLS policy for the admin user ID.
