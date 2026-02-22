# Run with keys only (no database password)

You can run the app and deploy Edge Functions **without** `supabase link` or a database password. Only the project ref and API keys from the Dashboard are needed.

---

## 1. One-time: Supabase CLI login

So the CLI can deploy to your project (uses a token, not the DB password):

```bash
supabase login
```

Open the link, enter the code. No database password.

---

## 2. Keys in `.env`

Your `.env` already has:

- `VITE_SUPABASE_URL` — project URL  
- `VITE_SUPABASE_PUBLISHABLE_KEY` — anon key  
- `VITE_SUPABASE_PROJECT_ID` / `SUPABASE_PROJECT_REF` — project ref  

Nothing else is required for the app or for function deploy.

---

## 3. Run the app

```bash
npm run dev
```

Uses the keys from `.env`. No password.

---

## 4. Deploy Edge Functions

```bash
./scripts/deploy-functions.sh
```

Uses your `supabase login` token and the project ref from `.env`. **No `supabase link` and no database password.**

If you get "Project not found", ensure you’re logged in (`supabase login`) and that `SUPABASE_PROJECT_REF` or `VITE_SUPABASE_PROJECT_ID` in `.env` is correct (Dashboard → Settings → General → Reference ID).

---

## When a database password is needed

Only these need the **database password** (Dashboard → Project Settings → Database):

- `supabase link` (and then `supabase db push`)
- `scripts/restore-db.sh`
- `scripts/import-recovery-data.sh`

You can skip link and still:

- Run the app (keys in `.env`)
- Deploy functions (`./scripts/deploy-functions.sh`)

For schema, either run migrations by hand in Dashboard → SQL Editor (paste from `supabase/migrations/*.sql`), or use the password once to run `supabase link` and `supabase db push`.
