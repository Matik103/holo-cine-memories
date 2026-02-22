#!/bin/bash
set -e

source .env

SQL=$(cat supabase/fix-missing-objects.sql)

curl -X POST "https://vkeurtlppyytdhyknqpx.supabase.co/rest/v1/rpc/exec" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\": $(echo "$SQL" | jq -Rs .)}"
