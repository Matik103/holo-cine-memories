#!/usr/bin/env bash
# Restore Supabase DB from cluster backup
# Usage:
#   Option 1 - Supabase Cloud (need DB password from Dashboard → Settings → Database):
#     SUPABASE_DB_PASSWORD='your-db-password' ./scripts/restore-db.sh
#   Option 2 - Local Supabase (after: supabase start):
#     RESTORE_TARGET=local ./scripts/restore-db.sh

set -e
BACKUP_FILE="${BACKUP_FILE:-/Users/ematik/Desktop/db_cluster-25-10-2025@07-02-38.backup}"
PROJECT_REF="${PROJECT_REF:-otaqvhoopxyinfzphzxh}"

if [[ ! -f "$BACKUP_FILE" ]]; then
  echo "Error: Backup file not found: $BACKUP_FILE"
  exit 1
fi

# \restrict is not a standard psql command - remove it so restore doesn't fail
CLEAN_BACKUP="${BACKUP_FILE%.backup}.restore.sql"
echo "Preparing backup (removing \\restrict line)..."
grep -v '^\\restrict ' "$BACKUP_FILE" > "$CLEAN_BACKUP"

if [[ "${RESTORE_TARGET}" == "local" ]]; then
  # Local Supabase (run: supabase start first)
  CONNECTION_STRING="postgresql://postgres:postgres@127.0.0.1:54322/postgres"
  echo "Restoring to LOCAL Supabase at 127.0.0.1:54322 ..."
else
  # Supabase Cloud - need password
  if [[ -z "${SUPABASE_DB_PASSWORD}" ]]; then
    echo "Error: SUPABASE_DB_PASSWORD is not set."
    echo "Get it from: Supabase Dashboard → Project Settings → Database → Database password"
    echo "Then run: SUPABASE_DB_PASSWORD='your-password' ./scripts/restore-db.sh"
    exit 1
  fi
  # Direct connection (required for restore; avoid pooler for full dump)
  CONNECTION_STRING="postgresql://postgres:${SUPABASE_DB_PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres"
  echo "Restoring to Supabase Cloud (project: ${PROJECT_REF}) ..."
fi

echo "Running psql restore (errors for existing roles/objects may appear; data restore may still succeed)..."
psql "$CONNECTION_STRING" \
  -v ON_ERROR_STOP=0 \
  -f "$CLEAN_BACKUP" \
  && echo "Restore finished." || echo "Restore ended with some errors (check output above)."

# Cleanup
rm -f "$CLEAN_BACKUP"
