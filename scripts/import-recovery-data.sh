#!/usr/bin/env bash
# Import recovery data into the Supabase DB (new or existing with schema applied).
# Requires: DB_URL set, OR SUPABASE_DB_PASSWORD + SUPABASE_PROJECT_REF (from .env)
#
# Usage:
#   DB_URL='postgresql://postgres:PASS@db.REF.supabase.co:5432/postgres' ./scripts/import-recovery-data.sh
#   SUPABASE_DB_PASSWORD='PASS' ./scripts/import-recovery-data.sh  (uses SUPABASE_PROJECT_REF from .env)

set -e
[ -f "$(dirname "$0")/../.env" ] && source "$(dirname "$0")/../.env"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
RECOVERY_DIR="$ROOT_DIR/data/recovery"

if [[ ! -d "$RECOVERY_DIR" ]]; then
  echo "Error: Recovery data not found. Run: python3 scripts/extract-recovery-data.py [backup-file]"
  exit 1
fi

if [[ -n "$DB_URL" ]]; then
  CONNECTION_STRING="$DB_URL"
else
  PASS="${SUPABASE_DB_PASSWORD:?Set SUPABASE_DB_PASSWORD or DB_URL}"
  REF="${SUPABASE_PROJECT_REF:?Set SUPABASE_PROJECT_REF in .env}"
  CONNECTION_STRING="postgresql://postgres:${PASS}@db.${REF}.supabase.co:5432/postgres"
fi

FILES=(
  auth_users.sql
  auth_identities.sql
  public_profiles.sql
  public_user_preferences.sql
  public_movie_searches.sql
  public_favorites.sql
  public_user_query_analytics.sql
)

echo "Importing recovery data into DB..."
for f in "${FILES[@]}"; do
  path="$RECOVERY_DIR/$f"
  if [[ -f "$path" ]]; then
    echo "  $f"
    psql "$CONNECTION_STRING" -v ON_ERROR_STOP=1 -f "$path" || { echo "Failed: $f"; exit 1; }
  else
    echo "  Skip (not found): $f"
  fi
done
echo "Done."
