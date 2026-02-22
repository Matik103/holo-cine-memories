#!/usr/bin/env bash
# Deploy Edge Functions using keys only — no link, no database password.
# Requires: supabase login (once). Project ref from .env or SUPABASE_PROJECT_REF.

set -e
cd "$(dirname "$0")/.."
# Load project ref from .env if present
if [[ -f .env ]]; then
  set -a
  source .env 2>/dev/null || true
  set +a
fi
PROJECT_REF="${SUPABASE_PROJECT_REF:-${VITE_SUPABASE_PROJECT_ID:-vkeurtlppyytdhyknqpx}}"

echo "Deploying Edge Functions to project: $PROJECT_REF (no link/password)"
supabase functions deploy --project-ref "$PROJECT_REF"
echo "Done."
