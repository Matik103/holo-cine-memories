# Production credentials from Supabase secrets

Credentials are **not** stored in the host. The frontend gets them from **Supabase** at runtime via a public Edge Function that reads Supabase-injected env (industry approach: single source of truth).

---

## How it works

1. **Build time:** Production needs only **one** variable (or none if you hardcode the project URL):
   - `VITE_SUPABASE_URL` = your project URL (e.g. `https://vkeurtlppyytdhyknqpx.supabase.co`).
2. **Runtime:** On first load, the app calls `GET ${VITE_SUPABASE_URL}/functions/v1/public-config`. That Edge Function returns `{ supabaseUrl, supabaseAnonKey }` from **Supabase secrets** (Supabase injects `SUPABASE_URL`; you add `SUPABASE_ANON_KEY` to the function’s secrets).
3. The app creates the Supabase client with that config. No anon key in the build or in the host’s env.

---

## 1. Add anon key to Supabase Edge Function secrets

The **public-config** function reads `SUPABASE_ANON_KEY` from its secrets. Supabase already injects `SUPABASE_URL`.

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project.
2. Go to **Project Settings** → **Edge Functions** (or **Functions** → **public-config**).
3. Under **Secrets**, add:
   - **Name:** `SUPABASE_ANON_KEY`
   - **Value:** your project’s **anon (public)** key from **Project Settings** → **API** → **Project API keys** → **anon** **public**.

Save. Redeploy the **public-config** function if you already deployed it.

---

## 2. Deploy the public-config function

If you haven’t deployed it yet:

```bash
cd /path/to/holo-cine-memories
supabase login
./scripts/deploy-functions.sh
```

Or deploy only this function:

```bash
supabase functions deploy public-config --project-ref YOUR_PROJECT_REF
```

---

## 3. Production build / host

**Option A – One env var (recommended)**  
Set in your host (any provider) only:

- `VITE_SUPABASE_URL` = `https://YOUR_PROJECT_REF.supabase.co`

The anon key is **not** set in the host; the app fetches it from Supabase at runtime.

**Option B – Both in env (fallback)**  
If you prefer to keep using host env (e.g. for local or legacy):

- `VITE_SUPABASE_URL` = project URL  
- `VITE_SUPABASE_PUBLISHABLE_KEY` = anon key  

Then the app uses these and does **not** call public-config.

---

## 4. Supabase URL config (auth)

In the **same** project, **Authentication** → **URL Configuration**:

- **Site URL:** your production origin (e.g. `https://www.cinemind.tech`).
- **Redirect URLs:** e.g. `https://www.cinemind.tech/**`, `https://www.cinemind.tech/auth`.

---

## Checklist

- [ ] `SUPABASE_ANON_KEY` added to Edge Function secrets (for **public-config**).
- [ ] **public-config** deployed (`supabase functions deploy public-config`).
- [ ] Production has at least `VITE_SUPABASE_URL` set (or both URL + key if using Option B).
- [ ] Supabase **Authentication** → **URL Configuration** includes your production URL.
- [ ] Redeploy the frontend after changing env so the new build runs.

---

## Summary

| Source        | What production needs                         |
|---------------|------------------------------------------------|
| Supabase      | `SUPABASE_ANON_KEY` in Edge Function secrets  |
| Host / build  | Only `VITE_SUPABASE_URL` (or URL + key)       |
| Runtime       | App fetches anon key from public-config      |

No anon key in the host; credentials come from Supabase secrets at runtime.
