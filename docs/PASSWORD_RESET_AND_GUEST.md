# Password reset and guest login

## Guest login – fixed

**Issue:** After clicking "Continue as Guest", the app showed the landing page again because when there was no Supabase session, the code always set "show landing".

**Fix:** In `CineMind.tsx`, when there is no session we now show the landing page only if the user is **not** in guest mode (`localStorage.getItem('guestMode') !== 'true'`). So "Continue as Guest" keeps you in the app.

**How to use:** On the Sign In tab, click **Continue as Guest**. You stay in the app without an account.

---

## Password reset – checklist

If you don’t receive the password reset email, check the following.

### 1. Redirect URL (Supabase Dashboard)

- **Authentication** → **URL Configuration**
- **Redirect URLs** must include the URL your app uses after reset, e.g.:
  - `https://www.cinemind.tech/auth`
  - `https://www.cinemind.tech/**`
  - For local: `http://localhost:5173/auth` and `http://localhost:5173/**`

### 2. Custom email hook (same project as your app)

Your app uses **project ref from `.env`** (e.g. `vkeurtlppyytdhyknqpx`). For that project:

- **Authentication** → **Email Templates** (or **Auth** → **Hook**)
- If you use a **custom Send Email hook**, it must be **enabled** and point to your Edge Function (e.g. `send-auth-emails`).
- The hook is configured in `supabase/config.toml` under `[auth.hook.send_email]` (when using that project). In the Dashboard, the same project must have the hook URL and secret set.

### 3. Edge Function secrets (Supabase Dashboard)

For the **send-auth-emails** function to send recovery (and signup) emails:

- **Project Settings** → **Edge Functions** → **Secrets** (or **Functions** → **send-auth-emails** → **Secrets**)
- Set:
  - **RESEND_API_KEY** – your Resend API key (so the function can send email).
  - **SEND_EMAIL_HOOK_SECRET** – must match the secret Supabase uses when calling the hook (see `config.toml` `[auth.hook.send_email]` secrets).

If these are missing, the function may fail or not send the reset email.

### 4. Production: same project and CORS

- Your **production** site must use the **same** Supabase project URL and anon key as in Dashboard (and the same project where the hook and redirect URLs are configured). Otherwise you get CORS/410 and recover requests never reach the right project.
- In that project, **Site URL** and **Redirect URLs** must include your production origin (e.g. `https://www.cinemind.tech` and `https://www.cinemind.tech/**`).

### 5. Test with curl

```bash
# Replace URL and ANON_KEY with your project
curl -X POST "https://YOUR_PROJECT.supabase.co/auth/v1/recover" \
  -H "apikey: ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","redirect_to":"https://www.cinemind.tech/auth"}'
```

If this returns 200 and you still don’t get the email, the problem is hook/Resend or inbox (spam, etc.). If you get CORS/410, fix project URL and redirect URLs as above.
