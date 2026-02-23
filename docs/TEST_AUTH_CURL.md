# Test Auth with curl

## 1. Set env

In `.env` set (from Supabase secrets or Dashboard → API):

- `VITE_SUPABASE_URL` = your project URL (e.g. `https://vkeurtippyytdhyknqpx.supabase.co`)
- `VITE_SUPABASE_PUBLISHABLE_KEY` = anon (public) key

## 2. Run the script

```bash
# Default test user: test+curl@example.com / TestPass123
./scripts/test-auth-curl.sh

# Custom email/password
./scripts/test-auth-curl.sh your@email.com YourPassword
```

The script runs:

1. **Sign up** – `POST /auth/v1/signup` (creates account; OK if already registered)
2. **Login** – `POST /auth/v1/token?grant_type=password` (returns `access_token`)
3. **Get user** – `GET /auth/v1/user` with `Authorization: Bearer <access_token>`

## 3. Manual curl (same as script)

Replace `$URL` and `$ANON_KEY` with your project URL and anon key.

**Sign up**

```bash
curl -X POST "$URL/auth/v1/signup" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"YourPass123","data":{"full_name":"Test"}}'
```

**Login**

```bash
curl -X POST "$URL/auth/v1/token?grant_type=password" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"YourPass123"}'
```

Use the `access_token` from the login response for protected calls.

**Get user**

```bash
curl -X GET "$URL/auth/v1/user" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 4. Optional: password recover (magic link)

```bash
curl -X POST "$URL/auth/v1/recover" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","redirect_to":"https://www.cinemind.tech/auth"}'
```
