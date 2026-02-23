#!/bin/bash
set -e

set -a
[ -f .env ] && source .env
set +a

: "${VITE_SUPABASE_URL:?Set VITE_SUPABASE_URL in .env}"
: "${SUPABASE_SERVICE_ROLE_KEY:?Set SUPABASE_SERVICE_ROLE_KEY (Supabase secrets / Dashboard → API)}"

SQL=$(cat supabase/fix-missing-objects.sql)
BASE="${VITE_SUPABASE_URL%/*}"

curl -X POST "${BASE}/rest/v1/rpc/exec" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\": $(echo "$SQL" | jq -Rs .)}"
