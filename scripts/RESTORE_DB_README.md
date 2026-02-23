# Restore database from backup

Backup file: `db_cluster-25-10-2025@07-02-38.backup` (full PostgreSQL cluster dump from Supabase).

## Restore to Supabase Cloud

1. **Get your database password**  
   Supabase Dashboard → **Project Settings** → **Database** → **Database password** (or reset it if you don’t have it).

2. **Run the restore script** (from repo root):
   ```bash
   SUPABASE_DB_PASSWORD='your-database-password' ./scripts/restore-db.sh
   ```

   Or with explicit backup path:
   ```bash
   BACKUP_FILE="/Users/ematik/Desktop/db_cluster-25-10-2025@07-02-38.backup" \
   SUPABASE_DB_PASSWORD='your-password' \
   ./scripts/restore-db.sh
   ```

3. **If you prefer to run `psql` yourself** (after removing the `\restrict` line from the backup):
   ```bash
   # Create a copy without \restrict (optional; script does this)
   grep -v '^\\restrict ' /Users/ematik/Desktop/db_cluster-25-10-2025@07-02-38.backup > /tmp/restore.sql

   psql "postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres" \
     -v ON_ERROR_STOP=0 \
     -f /tmp/restore.sql
   ```

**Note:** Restoring a full cluster dump into an **existing** project will produce errors for roles and objects that already exist (`ON_ERROR_STOP=0` lets the script continue). Your **data** (e.g. `public.*`, `auth.users`, etc.) should still be restored. If you need a clean restore, use a **new** Supabase project and run the restore there.

---

## Restore to local Supabase (Docker)

1. Start local Supabase (from repo root):
   ```bash
   npx supabase start
   ```

2. Run the restore script:
   ```bash
   RESTORE_TARGET=local ./scripts/restore-db.sh
   ```

3. Or with `psql` directly:
   ```bash
   psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" \
     -v ON_ERROR_STOP=0 \
     -f /path/to/backup.restore.sql
   ```
   (Use the cleaned file without `\restrict` as above.)

---

## Requirements

- **psql** (PostgreSQL client). Install with:
  - macOS: `brew install libpq` then `brew link --force libpq`
  - Or install [PostgreSQL](https://postgresql.org/download/) which includes `psql`
