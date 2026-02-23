# Fix: Login CORS / 410 on production (www.cinemind.tech)

If you see:

- **Cross-Origin Request Blocked** … `auth/v1/token?grant_type=password`  
- **CORS header 'Access-Control-Allow-Origin' missing**  
- **Status code: 410**  
- **NetworkError when attempting to fetch resource**

the browser is calling your **production** Supabase project (e.g. `vkeurtippyytdhyknqpx.supabase.co`) and the request is being rejected. Two things to fix in the **Supabase Dashboard** for that project.

---

## 1. Allow your production URL (fixes CORS)

1. Open [Supabase Dashboard](https://supabase.com/dashboard) and select the project your **production** site uses (the one in your production `VITE_SUPABASE_URL`, e.g. `vkeurtippyytdhyknqpx`).
2. Go to **Authentication** → **URL Configuration**.
3. Set **Site URL** to your production origin, e.g.  
   `https://www.cinemind.tech`
4. Under **Redirect URLs**, add:
   - `https://www.cinemind.tech/**`
   - `https://cinemind.tech/**` (if you use the non-www domain)
5. Save.

Without these, Supabase Auth does not send `Access-Control-Allow-Origin` for your frontend origin, so the browser reports CORS and the login request fails.

---

## 2. Unpause the project if it’s paused (fixes 410)

1. In the same project, open **Project Settings** (gear) → **General**.
2. If you see that the project is **Paused** (common on free tier after inactivity), click **Restore project** and wait until it’s active.

A paused project often returns **410 Gone** (or similar) and may not send CORS headers, which matches the error you see.

---

## 3. Confirm production env vars

Your production build must use the **same** project as in the Dashboard:

- `VITE_SUPABASE_URL` = `https://<project-ref>.supabase.co`  
- `VITE_SUPABASE_PUBLISHABLE_KEY` = that project’s **anon** key (Project Settings → API).

If the deployed site uses a different project than the one you configured in steps 1–2, repeat steps 1–2 for the project that the production URL actually uses.

---

After updating URL Configuration and restoring the project if needed, try logging in again on www.cinemind.tech.
