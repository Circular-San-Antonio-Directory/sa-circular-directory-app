# Adding New Airtable Columns to PostgreSQL

When you add a new column to any Airtable table, follow these 3 steps to get it into the DB and available to the app.

---

## Step 1 — Write a SQL migration

Create a new file in `migrations/` (increment the number, e.g. `007_...sql`):

```sql
-- migrations/007_add_my_new_columns.sql
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS my_new_field TEXT;
-- or for a lookup table:
ALTER TABLE categories ADD COLUMN IF NOT EXISTS some_flag BOOLEAN;
```

Also add the column to `migrations/current_schema.sql` (canonical full schema, used by db:reset).

---

## Step 2 — Update the sync script (`src/lib/sync.ts`)

### For lookup tables (categories, tags, business_actions, core_material_systems, enabling_systems, business_activities, business_types)

Add the Airtable field name → SQL column name to the `fieldMap` in the `upsertLookup` call (~line 305):

```ts
// before
upsertLookup('categories', data.categories, { Category: 'category', Items: 'items' })

// after
upsertLookup('categories', data.categories, { Category: 'category', Items: 'items', 'My New Airtable Field': 'my_new_column' })
```

### For the businesses table (Airtable: "Production DB")

Touch `upsertBusinesses()` in four places:

1. `INSERT INTO businesses (...)` column list (~line 121)
2. `VALUES (...)` placeholder list
3. `ON CONFLICT ... DO UPDATE SET` block (~line 144)
4. The values array passed to `pool.query()` (~line 199) — add `f['Airtable Field Name'] ?? null`

---

## Step 3 — Apply the migration to the DB

```bash
psql $DATABASE_URL -f migrations/007_add_my_new_columns.sql
```

Then trigger a sync: **"Deploy Now"** on the `airtable-sync` service in the Railway dashboard.

---

## Optional Step 4 — Expose the data in the app

- For `businesses` columns: update the `Listing` type and SELECT query in `src/lib/getListings.ts`
- For `categories` columns: update `src/lib/getCategories.ts`

---

## Notes

- The sync uses `ON CONFLICT (airtable_id) DO UPDATE` — re-running is always safe.
- Airtable field names are case-sensitive and must match exactly (watch for typos — see "Known Airtable field quirks" in `docs/architecture.md`).
- Ask Claude to do all 4 steps in one pass — just say which table and field names you added.
