#!/usr/bin/env bash
# Test Supabase Auth with curl: signup, login, get user, optional recover.
# Usage: ./scripts/test-auth-curl.sh [email] [password]
#   If email/password omitted, uses test+curl@example.com / TestPass123
#   To test password reset: ./scripts/test-auth-curl.sh your@email.com  (recover only, no signup/login)
#   Or set RECOVER_ONLY=1 to only call /auth/v1/recover for the given email.

set -e
cd "$(dirname "$0")/.."
set -a
[ -f .env ] && source .env
set +a

: "${VITE_SUPABASE_URL:?Set VITE_SUPABASE_URL in .env}"
: "${VITE_SUPABASE_PUBLISHABLE_KEY:?Set VITE_SUPABASE_PUBLISHABLE_KEY in .env (anon key)}"

EMAIL="${1:-test+curl@example.com}"
PASS="${2:-TestPass123}"
BASE="${VITE_SUPABASE_URL}"
KEY="$VITE_SUPABASE_PUBLISHABLE_KEY"

echo "=== Supabase Auth curl tests ==="
echo "URL: $BASE"
echo "Email: $EMAIL"
echo ""

# Optional: only test recover (password reset email)
if [[ "${RECOVER_ONLY}" == "1" ]]; then
  echo "--- Recover (password reset email) ---"
  REDIRECT="${3:-https://www.cinemind.tech/auth}"
  RECOVER_RESP=$(curl -s -w "\n%{http_code}" -X POST "${BASE}/auth/v1/recover" \
    -H "apikey: ${KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"${EMAIL}\",\"redirect_to\":\"${REDIRECT}\"}")
  RECOVER_HTTP=$(echo "$RECOVER_RESP" | tail -n1)
  RECOVER_BODY=$(echo "$RECOVER_RESP" | sed '$d')
  echo "HTTP: $RECOVER_HTTP"
  echo "$RECOVER_BODY" | jq . 2>/dev/null || echo "$RECOVER_BODY"
  [[ "$RECOVER_HTTP" == "200" ]] && echo "Recover request OK (check email)" || echo "Recover failed"
  exit 0
fi

# 1) Sign up
echo "--- 1) Sign up (create account) ---"
SIGNUP_RESP=$(curl -s -w "\n%{http_code}" -X POST "${BASE}/auth/v1/signup" \
  -H "apikey: ${KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASS}\",\"data\":{\"full_name\":\"Curl Test\"}}")
SIGNUP_HTTP=$(echo "$SIGNUP_RESP" | tail -n1)
SIGNUP_BODY=$(echo "$SIGNUP_RESP" | sed '$d')
echo "HTTP: $SIGNUP_HTTP"
echo "$SIGNUP_BODY" | jq . 2>/dev/null || echo "$SIGNUP_BODY"

if [[ "$SIGNUP_HTTP" == "200" ]] || [[ "$SIGNUP_HTTP" == "201" ]]; then
  echo "Sign up OK"
elif echo "$SIGNUP_BODY" | grep -q "already registered"; then
  echo "User already exists (OK for login test)"
else
  echo "Sign up failed (may be OK if user exists)"
fi
echo ""

# 2) Login (token)
echo "--- 2) Login (token grant_type=password) ---"
TOKEN_RESP=$(curl -s -w "\n%{http_code}" -X POST "${BASE}/auth/v1/token?grant_type=password" \
  -H "apikey: ${KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASS}\"}")
TOKEN_HTTP=$(echo "$TOKEN_RESP" | tail -n1)
TOKEN_BODY=$(echo "$TOKEN_RESP" | sed '$d')
echo "HTTP: $TOKEN_HTTP"
echo "$TOKEN_BODY" | jq . 2>/dev/null || echo "$TOKEN_BODY"

ACCESS_TOKEN=$(echo "$TOKEN_BODY" | jq -r '.access_token // empty')
if [[ -z "$ACCESS_TOKEN" ]]; then
  echo "Login failed: no access_token in response"
  exit 1
fi
echo "Login OK (got access_token)"
echo ""

# 3) Get user (protected)
echo "--- 3) Get user (protected route) ---"
USER_RESP=$(curl -s -w "\n%{http_code}" -X GET "${BASE}/auth/v1/user" \
  -H "apikey: ${KEY}" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")
USER_HTTP=$(echo "$USER_RESP" | tail -n1)
USER_BODY=$(echo "$USER_RESP" | sed '$d')
echo "HTTP: $USER_HTTP"
echo "$USER_BODY" | jq . 2>/dev/null || echo "$USER_BODY"

if [[ "$USER_HTTP" == "200" ]]; then
  echo "Get user OK"
else
  echo "Get user failed"
  exit 1
fi
echo ""

echo "=== All auth curl tests passed ==="
