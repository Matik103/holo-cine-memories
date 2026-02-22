#!/bin/bash
set -e

# Load environment variables
source .env

# Get service role key (you'll need to add this)
if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "Error: SUPABASE_SERVICE_ROLE_KEY not set in .env"
  exit 1
fi

# Apply each migration
for migration in supabase/migrations/*.sql; do
  echo "Applying $(basename $migration)..."
  
  # Read the SQL file
  SQL=$(cat "$migration")
  
  # Execute via PostgREST rpc or direct SQL endpoint
  curl -X POST "https://${SUPABASE_PROJECT_REF}.supabase.co/rest/v1/rpc/exec_sql" \
    -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"query\": $(echo "$SQL" | jq -Rs .)}"
  
  echo "✓ Applied $(basename $migration)"
done

echo "All migrations applied successfully!"
