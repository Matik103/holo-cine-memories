# Production credentials from Supabase secrets

Credentials are **not** stored in the host. The frontend gets **everything** from **Supabase** at runtime via a public Edge Function (single source of truth). **No host environment variables are required.**

---

## How it works

1. **Build time:** No Supabase env vars are required on the host. The app has a single hardcoded config URL: the **public-config** Edge Function of the active project (`vkeurtlppyytdhyknqpx`).
2. **Runtime:** On first load, the app calls `GET https://vkeurtlppyytdhyknqpx.supabase.co/functions/v1/public-config`. That Edge Function returns `{ supabaseUrl, supabaseAnonKey }` from **Supabase secrets** (Supabase injects `SUPABASE_URL`; you add `SUPABASE_ANON_KEY` to the function’s secrets).
3. The app creates the Supabase client with that config. No URL or anon key in the build or in the host.

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

**No host env required (default).**  
Deploy the frontend as-is. The app fetches Supabase URL and anon key from the **public-config** Edge Function at runtime. No `VITE_SUPABASE_*` variables need to be set on the host.

**Optional – override with env (e.g. local/dev)**  
If you set in `.env` or host:

- `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` → app uses them and does not call public-config.
- Only `VITE_SUPABASE_URL` → app still calls public-config at that URL to get the anon key.

---

## 4. Supabase URL config (auth)

In the **same** project, **Authentication** → **URL Configuration**:

- **Site URL:** your production origin (e.g. `https://www.cinemind.tech`).
- **Redirect URLs:** e.g. `https://www.cinemind.tech/**`, `https://www.cinemind.tech/auth`.

---

## Checklist

- [ ] `SUPABASE_ANON_KEY` added to Edge Function secrets (for **public-config**).
- [ ] **public-config** deployed (`supabase functions deploy public-config`).
- [ ] Supabase **Authentication** → **URL Configuration** includes your production URL.
- [ ] Deploy the frontend; no host env vars needed.

---

## Summary

| Source   | What production needs                                |
|----------|------------------------------------------------------|
| Supabase | `SUPABASE_ANON_KEY` in Edge Function secrets; public-config deployed |
| Host     | **Nothing** – app fetches URL + anon key from public-config at runtime |

---

## Troubleshooting: 410 / CORS / “not calling the functions”

If production shows **410** or **CORS** and the request URL is **`https://otaqvhoopxyinfzphzxh.supabase.co`**:

- **Cause:** An old build or override is still using the wrong project. The app is configured to use **`vkeurtlppyytdhyknqpx`** when no env is set (hardcoded config URL).
- **Fix:** Redeploy the frontend **without** setting any `VITE_SUPABASE_*` on the host so the app uses the built-in config URL. If you do set env, use `VITE_SUPABASE_URL=https://vkeurtlppyytdhyknqpx.supabase.co`.
