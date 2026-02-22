#!/usr/bin/env python3
"""
Extract recoverable table data from a PostgreSQL cluster backup (.backup dump).
Outputs one .sql file per table for import into a new Supabase DB (after schema is applied).

Usage:
  python scripts/extract-recovery-data.py [path-to.backup]
  Default backup: /Users/ematik/Desktop/db_cluster-25-10-2025@07-02-38.backup
"""

import re
import sys
from pathlib import Path

# Tables to extract, in import order (auth.users first, then identities, then public)
TABLES = [
    "auth.users",
    "auth.identities",
    "public.profiles",
    "public.user_preferences",
    "public.movie_searches",
    "public.favorites",
    "public.user_query_analytics",
]

COPY_PATTERN = re.compile(r"^COPY\s+([a-z_]+\.[a-z_]+)\s+\(.*\)\s+FROM\s+stdin\s*;?\s*$", re.I)


def main():
    backup_path = sys.argv[1] if len(sys.argv) > 1 else "/Users/ematik/Desktop/db_cluster-25-10-2025@07-02-38.backup"
    backup = Path(backup_path)
    if not backup.exists():
        print(f"Error: Backup file not found: {backup}")
        sys.exit(1)

    out_dir = Path(__file__).resolve().parent.parent / "data" / "recovery"
    out_dir.mkdir(parents=True, exist_ok=True)

    wanted = set(TABLES)
    capturing = False
    current_table = None
    buffer = []

    with open(backup, "r", encoding="utf-8", errors="replace") as f:
        for line in f:
            if capturing:
                if line.rstrip("\n") == "\\.":
                    # End of COPY data
                    buffer.append(line)
                    out_name = current_table.replace(".", "_") + ".sql"
                    out_path = out_dir / out_name
                    with open(out_path, "w", encoding="utf-8") as out:
                        out.writelines(buffer)
                    print(f"  Extracted {current_table} -> {out_path.relative_to(out_dir.parent.parent)}")
                    buffer = []
                    capturing = False
                    current_table = None
                else:
                    buffer.append(line)
                continue

            m = COPY_PATTERN.match(line)
            if m:
                table = m.group(1)
                if table in wanted:
                    capturing = True
                    current_table = table
                    buffer = [line]

    print(f"\nRecovery data written to: {out_dir}")
    print("Import order: run the .sql files in the order listed in data/recovery/README.md")


if __name__ == "__main__":
    main()
