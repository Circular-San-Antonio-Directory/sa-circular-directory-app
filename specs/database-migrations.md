# Database Migration Workflow

How to add a new schema change (column, table, view update) and what happens automatically at deploy time.

---

## The Short Version

1. Write your SQL file in `migrations/` with a numbered name (`010_your_change.sql`)
2. Apply it to **staging** manually
3. Commit and push
4. **Railway handles production automatically** at the next deploy

---

## What Happens Automatically at Deploy

When Railway runs the pre-deploy command (`scripts/promote-db.sh`), it does two things in order:

### Step 1 — `scripts/runMigrations.js`
- Creates a `schema_migrations` table in the **production** database if it doesn't exist yet
- Scans `migrations/` for files matching the pattern `###_*.sql` (three-digit prefix), sorted alphabetically
- Checks which files are already recorded in `schema_migrations`
- Runs any **pending** migrations in order, each wrapped in a transaction
- Records each applied migration name in `schema_migrations` so it won't run again

### Step 2 — `scripts/promote-db.js`
- Copies all data from staging to production
- At this point production schema is guaranteed up-to-date, so the copy succeeds

---

## What You Need to Do Manually

### 1. Write the migration file

Create a new `.sql` file in `migrations/` using the next number in sequence:

```
migrations/010_your_change.sql
```

**Naming rules:**
- Three-digit numeric prefix (`010`, `011`, etc.) — this controls execution order
- Use `ADD COLUMN IF NOT EXISTS`, `DROP VIEW IF EXISTS`, `CREATE TABLE IF NOT EXISTS` — keep migrations idempotent in case they ever need to re-run

**Example:**
```sql
-- Migration 010: Add website_verified column

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS website_verified BOOLEAN DEFAULT FALSE;
```

If your migration changes or adds columns to `businesses`, you also need to drop and recreate the `businesses_complete` view (see any prior migration for the pattern).

### 2. Apply it to staging

Run the migration against your **staging** database before committing:

```bash
STAGING_DB_URL="<your-staging-url>" DATABASE_URL="<your-staging-url>" \
  node scripts/runMigration.js migrations/010_your_change.sql
```

Or if your `.env` already points to staging:

```bash
node scripts/runMigration.js migrations/010_your_change.sql
```

Test that your app works correctly against staging before continuing.

### 3. Commit and push

```bash
git add migrations/010_your_change.sql
git commit -m "Add migration 010: your change description"
git push
```

### 4. Deploy

Trigger a deploy on Railway (or let CI do it). The pre-deploy step applies the migration to production automatically before any data is promoted from staging.

---

## Scenarios

### Normal flow
> You added a column, tested on staging, and are ready to ship.

Do steps 1–4 above. Nothing else required.

---

### Production is behind staging (emergency manual fix)
> A deploy failed because production was missing a column — like the `tiktok_handle` incident.

Apply the missing migration directly to production using the public database URL:

```bash
DATABASE_URL="postgresql://postgres:<password>@metro.proxy.rlwy.net:19127/railway" \
  node scripts/runMigration.js migrations/009_your_migration.sql
```

Then retrigger the Railway deployment. The migration runner will skip the file on the next run (it records the name in `schema_migrations`), so there's no double-apply risk.

---

### You need to apply all pending migrations to production without a full deploy
> e.g., you want to verify the schema state before deploying.

```bash
DATABASE_URL="postgresql://postgres:<password>@metro.proxy.rlwy.net:19127/railway" \
  node scripts/runMigrations.js
```

Run it twice to confirm idempotency — the second run should print `✅ No pending migrations`.

---

### Destructive change (dropping a column or table)
> Railway will auto-run this in production if it matches `###_*.sql`.

Be careful: `runMigrations.js` will apply **any** numbered migration file on the next deploy. If you're dropping something, make sure you've verified on staging first. There is no automatic rollback — the transaction will roll back on SQL error, but a successful `DROP` cannot be undone by the runner.

---

## Files Reference

| File | Purpose |
|---|---|
| `migrations/###_*.sql` | Incremental migration files — auto-applied by runner |
| `migrations/current_schema.sql` | Full schema snapshot — **not auto-run** (no numeric prefix pattern match) |
| `migrations/drop_all_tables.sql` | Destructive utility — **not auto-run** |
| `scripts/runMigrations.js` | Migration runner with `schema_migrations` tracking |
| `scripts/runMigration.js` | Single-file runner — for manual/one-off use |
| `scripts/promote-db.sh` | Pre-deploy entry point — calls migrations then promote |
| `scripts/promote-db.js` | Stages → production data copy |

---

## The `schema_migrations` Table

Stored in the **production** database. Created automatically on first run.

```sql
schema_migrations (
  name       VARCHAR  PRIMARY KEY,   -- filename, e.g. "010_your_change.sql"
  applied_at TIMESTAMPTZ             -- when it was applied
)
```

To inspect what's been applied:

```bash
DATABASE_URL="postgresql://postgres:<password>@metro.proxy.rlwy.net:19127/railway" \
  node -e "
    const { query, end } = require('./scripts/dbConfig');
    query('SELECT * FROM schema_migrations ORDER BY applied_at')
      .then(r => { console.table(r.rows); end(); });
  "
```
