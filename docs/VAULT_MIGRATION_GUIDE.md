# Vault Data Migration - Quick Start

## 🎯 What This Does

Migrates all existing search data from `movie_searches` table to populate the Vault with:
- **Trending movies** with accurate recall counts
- **User stats** with scores and search counts
- **Activity feed** with recent searches
- **Streaks** calculated from search history

## 📋 Run the Migration

### Option 1: Supabase Dashboard (Recommended)

1. Go to: https://supabase.com/dashboard/project/vkeurtlppyytdhyknqpx/sql
2. Click "New Query"
3. Copy the entire content from: `supabase/vault-functions.sql`
4. Paste into the SQL editor
5. Click "Run" (or press Cmd/Ctrl + Enter)

### Option 2: Command Line

```bash
# Using psql
psql "postgresql://postgres:un1zsqGsIplkAI2t@db.vkeurtlppyytdhyknqpx.supabase.co:5432/postgres" \
  -f supabase/vault-functions.sql

# Or using Supabase CLI
supabase db execute --file supabase/vault-functions.sql --project-ref vkeurtlppyytdhyknqpx
```

## ✅ What Gets Migrated

### From `movie_searches` table:
- Movie titles and years
- Search counts (hour/day/week/total)
- Poster URLs
- User search history

### From `profiles` table:
- User display names
- User IDs

### From `favorites` table:
- Movie ratings (for hidden gems)
- Favorite activities

## 📊 Expected Results

After running the migration, you should see:

```sql
-- Check trending movies
SELECT movie_title, recall_count_total 
FROM vault_trending 
ORDER BY recall_count_total DESC 
LIMIT 10;

-- Check user stats
SELECT display_name, vault_score, total_searches 
FROM vault_user_stats 
ORDER BY vault_score DESC 
LIMIT 10;

-- Check activity feed
SELECT activity_type, movie_title, display_name 
FROM vault_activity_feed 
ORDER BY created_at DESC 
LIMIT 20;
```

## 🔄 Safe to Re-run

The migration uses `ON CONFLICT DO NOTHING` so it's safe to run multiple times. It will only add new data, not duplicate existing records.

## 🎬 After Migration

1. Visit `/vault` page - should show trending movies from real searches
2. Check "Hidden Gems" - should show low-search, high-rated movies
3. Check "Champions" - should show users with highest scores
4. User stats should reflect actual search history

## 🐛 Troubleshooting

### No data showing?
```sql
-- Check if movie_searches has data
SELECT COUNT(*) FROM movie_searches;

-- Check if vault_trending was populated
SELECT COUNT(*) FROM vault_trending;
```

### Users not showing in champions?
```sql
-- Check vault_user_stats
SELECT * FROM vault_user_stats ORDER BY vault_score DESC;
```

### Need to reset and re-migrate?
```sql
-- Clear vault data (careful!)
TRUNCATE vault_trending, vault_user_stats, vault_activity_feed CASCADE;

-- Then re-run the migration
```

## 📝 Notes

- Migration processes last 100 searches for activity feed
- Streaks are calculated from search date patterns
- Scores are calculated as: searches × 5 points
- TMDB fallback still works if no local data
