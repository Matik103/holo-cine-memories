#!/usr/bin/env bash
# Test movie-identify Edge Function with a 2-word query.
# Usage: ./scripts/test-movie-identify.sh [query]
# Example: ./scripts/test-movie-identify.sh "Robot human"

set -e
cd "$(dirname "$0")/.."
QUERY="${1:-Robot human}"

if [ ! -f .env ]; then
  echo "Missing .env. Copy .env.example and set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY."
  exit 1
fi
set -a
. ./.env
set +a

if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_PUBLISHABLE_KEY" ]; then
  echo "Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env"
  exit 1
fi

echo "Testing movie-identify with query: \"$QUERY\""
echo "POST $VITE_SUPABASE_URL/functions/v1/movie-identify"
echo "---"
curl -s -X POST "$VITE_SUPABASE_URL/functions/v1/movie-identify" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $VITE_SUPABASE_PUBLISHABLE_KEY" \
  -d "{\"query\":\"$QUERY\"}" | jq . 2>/dev/null || cat
