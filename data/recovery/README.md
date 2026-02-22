# Recovery data for new database

This folder contains **table data only** (COPY format) extracted from the backup  
`db_cluster-25-10-2025@07-02-38.backup`. Use it to seed a **new** Supabase DB after the schema is applied.

## Contents

| File | Table | Description |
|------|--------|-------------|
| `auth_users.sql` | auth.users | User accounts (email, password hash, metadata) |
| `auth_identities.sql` | auth.identities | Auth provider links (email, etc.) |
| `public_profiles.sql` | public.profiles | Display name, avatar (references auth.users) |
| `public_user_preferences.sql` | public.user_preferences | CineDNA, genres, mood (references auth.users) |
| `public_movie_searches.sql` | public.movie_searches | Past searches (references auth.users) |
| `public_favorites.sql` | public.favorites | Watchlist / favorites (references auth.users) |
| `public_user_query_analytics.sql` | public.user_query_analytics | Query analytics (references auth.users) |

## Import order (required)

Tables depend on `auth.users(id)`. Run in this order:

1. **auth_users.sql** – create users first  
2. **auth_identities.sql** – then identities  
3. **public_profiles.sql**  
4. **public_user_preferences.sql**  
5. **public_movie_searches.sql**  
6. **public_favorites.sql**  
7. **public_user_query_analytics.sql**

## How to use with a new DB

### 1. Create new Supabase project and apply schema

```bash
npx supabase link --project-ref YOUR_NEW_PROJECT_REF
npx supabase db push
```

### 2. Import recovery data

From the **project root**, with your DB connection string (Dashboard → Settings → Database):

```bash
# Set once (use your new project's database password)
export DB_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres"

# Run in order (from repo root)
psql "$DB_URL" -f data/recovery/auth_users.sql
psql "$DB_URL" -f data/recovery/auth_identities.sql
psql "$DB_URL" -f data/recovery/public_profiles.sql
psql "$DB_URL" -f data/recovery/public_user_preferences.sql
psql "$DB_URL" -f data/recovery/public_movie_searches.sql
psql "$DB_URL" -f data/recovery/public_favorites.sql
psql "$DB_URL" -f data/recovery/public_user_query_analytics.sql
```

Or use the helper script:

```bash
./scripts/import-recovery-data.sh
# Requires: DB_URL or SUPABASE_DB_PASSWORD + SUPABASE_PROJECT_REF
```

### 3. Notes

- **auth.users**: Restored users can log in with their **existing passwords** (hashes are in the backup).
- **Admin analytics**: The RLS policy for `user_query_analytics` may reference a specific admin user ID. After import, set that in a new migration or SQL to your new admin user’s ID if needed.
- **Storage**: This recovery set does **not** include Storage file objects; only DB rows. Re-upload any needed files or restore Storage separately.

## Regenerating from the backup

To re-extract from the original backup (e.g. after updating the backup file):

```bash
python3 scripts/extract-recovery-data.py /path/to/db_cluster-25-10-2025@07-02-38.backup
```
