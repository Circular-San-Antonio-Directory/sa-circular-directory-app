# SA Circular Directory — Architecture & Data Flow

## Guiding Principles

- **Affordable** — avoid services with monthly fees where possible; prefer usage-based or free tiers
- **Accessible** — no technical learning curve for contributors managing data; Airtable UI is the control surface
- **Simple** — minimal moving parts, clear promotion path from staging → production
- **AI-assisted** — leverage AI for sync logic, data mapping, and QA tooling where it reduces manual work

---

## Tech Stack

| Layer | Tool | Why |
|---|---|---|
| Data source of truth | Airtable | Non-technical team can manage data via UI |
| App database | PostgreSQL + PostGIS (Railway) | Free on Railway hobby plan; PostGIS enables future map queries |
| API layer | Raw `pg` pool queries via `src/lib/db.ts` | Prisma was planned but not yet implemented; pg is used directly |
| Frontend + backend | Next.js (App Router) | Monorepo — one repo, one deploy per environment |
| Infrastructure | Railway | Git-based deploys, managed Postgres, environment support, no monthly fee on hobby |
| Maps | Mapbox | Render location data on the frontend |

> **Note:** The tech stack table originally listed Prisma and tRPC — neither is in use yet. The app queries the DB directly via `pg` pool.

---

## System Architecture

```mermaid
graph TB
    subgraph "External Services"
        AT[Airtable<br/>Source of Truth]
        MB[Mapbox<br/>Map Service]
    end

    subgraph "Railway Infrastructure"
        subgraph "Staging Environment"
            STGDB[(Staging PostgreSQL<br/>with PostGIS)]
            STGAPP[Staging Next.js App]
            STGCRON[airtable-sync<br/>Cron Service]
        end

        subgraph "Production Environment"
            PRODDB[(Production PostgreSQL<br/>with PostGIS)]
            PRODAPP[Production Next.js App]
        end
    end

    subgraph "Users"
        USER[End Users]
    end

    AT -->|Daily Cron / On-Demand| STGCRON
    STGCRON -->|Upsert| STGDB
    STGAPP -->|Read| STGDB
    STGDB -.->|Manual QA & Promotion| PRODDB
    PRODAPP -->|Read Only| PRODDB
    USER -->|HTTPS| PRODAPP
    USER -->|HTTPS| STGAPP
    PRODAPP -->|Render Maps| MB
    STGAPP -->|Render Maps| MB
```

---

## Environments

| | Staging | Production |
|---|---|---|
| **Trigger** | Push to `main` branch | Merge `main` → `production` branch |
| **Database** | Staging PostgreSQL | Production PostgreSQL |
| **Airtable sync** | Daily cron + manual via Railway dashboard "Deploy Now" | Promoted from staging only |
| **Purpose** | QA & verification | Live to end users |

### Deploy flow
```
Airtable UI (data changes)
  └── Daily cron job (airtable-sync service, 0 6 * * * UTC) → Staging DB
        └── QA passes on staging → merge main → production branch
                          └── Railway builds production app (~3-5 min)
                                └── Pre-deploy: scripts/promote-db.sh
                                      ├── pg_dump staging DB (~15s)
                                      └── pg_restore production DB (~30s, blocks existing queries)
                                            └── ✅ Success → traffic switches to new app
                                            └── ❌ Failure → old deployment stays live
```

**Release workflow:**
```bash
git checkout main && git pull
git checkout production && git merge main && git push origin production
# Optionally tag for version tracking: git tag v1.0.0 && git push origin v1.0.0
```

---

## Airtable

- **Base ID:** `apppd7CyLPeDWBkLz`
- **Primary table:** `Production DB` (table ID: `tblujaqw04RqX2j3P`)
- **Env var:** `AIRTABLE_API_KEY` (stored in Railway, never hardcode)
- **Env var:** `AIRTABLE_BASE_ID` = `apppd7CyLPeDWBkLz` (stored in Railway)

Airtable is **read-only from the app's perspective.** All data edits happen in Airtable. The sync job pulls from Airtable and writes to the staging PostgreSQL database.

### Airtable tables synced

| Airtable Table | Postgres Table | Notes |
|---|---|---|
| `Production DB` | `businesses` | Main listing records |
| `Business Actions` | `business_actions` | Has `Corresponding Action` (user-facing label), `Order for Display` (sort order), `Icon to Use` (SVG icon key), and `Colorway` (color family token) |
| `Categories` | `categories` | Has `Items` (comma-separated item strings) and `FA Icon` (Font Awesome icon name, no prefix) |
| `Business Type` | `business_types` | |
| `Core Material System` | `core_material_systems` | |
| `Enabling Systems` | `enabling_systems` | |
| `Tag` | `tags` | |
| `Business Activity` | `business_activities` | |

### Known Airtable field quirks

- **`Listing Photo`** — stored as a plain URL string (not an Airtable attachment array). Extract directly: `f['Listing Photo']`, not `f['Listing Photo'][0].url`.
- **`Business Descriptios`** — typo in Airtable field name ("Descriptios", not "Description"). The sync uses the misspelled name to match.
- **`Type of Business`** — Airtable field name in `Production DB`; the sync references it as `Type of Listing` (legacy mismatch — verify if this causes data loss).
- **`SERVICE Category - Override`** — Airtable field is named `SERVICE - Override or Specific (Unique items or category)`; verify sync field name matches.
- **`Business Actions` → `Action` field** — stores the business-perspective label (e.g. "Accepts Dropoff", "Sells"). The `Corresponding Action` field stores the user-facing label (e.g. "Donate", "Buy"). The app maps between them via `src/lib/actionMapping.ts`.

---

## Data Sync

### How it works

Sync logic lives in `src/lib/sync.ts` and is called by one active entry point:

| Entry point | When to use |
|---|---|
| `scripts/sync.ts` + `npm run sync` | Railway Cron service (primary), or local testing |

The sync fetches all 8 Airtable tables into memory, upserts lookup tables in parallel, upserts businesses, then geocodes any un-geocoded addresses via the Mapbox Geocoding API. All upserts use `ON CONFLICT (airtable_id) DO UPDATE` so re-running is safe.


### Railway Cron service (`airtable-sync`)

- **Service name:** `airtable-sync` (ID: `1ae4e62e-9793-4678-a2e5-858efe4aeb47`)
- **Schedule:** `0 6 * * *` (6am UTC = midnight CT)
- **Start command:** `npm run sync`
- **Manual trigger:** click **"Deploy Now"** in the Railway dashboard on the `airtable-sync` service
- **Env vars required:** `DATABASE_URL`, `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID`, `MAPBOX_SECRET_TOKEN`, `NODE_ENV=production`

> **`NODE_ENV=production` is required** on the cron service so `src/lib/db.ts` enables SSL for the Railway internal Postgres connection.

### Production promotion (Staging DB → Production DB)

- **Trigger** — Merge `main` → `production` branch; always a deliberate human action
- **Automated via Railway pre-deploy** — `scripts/promote-db.sh` runs as the pre-deploy command on the production `sa-circular-directory-app` service; if it fails, the deployment is aborted and the old version stays live
- **Manual fallback** — `npm run db:promote` (requires `STAGING_DB_URL` and `DATABASE_URL` in `.env`)
- **Script:** `scripts/promote-db.sh` — `pg_dump --format=custom` staging → `pg_restore --clean --if-exists --single-transaction` production
- **Downtime:** ~30s of blocked (hanging) queries during the restore; acceptable for infrequent releases

---

## Database Schema

Schema is managed with plain SQL migration files in `migrations/`. There is no ORM migration runner — apply files manually or via an admin script.

| File | Purpose |
|---|---|
| `migrations/current_schema.sql` | Canonical full schema — keep this up to date; used by `db:reset` + `migrate:sql` for fresh installs |
| `migrations/003_add_action_columns.sql` | Incremental: adds `corresponding_action` + `display_order` to `business_actions`, updates `businesses_complete` view |
| `migrations/004_add_geocoding.sql` | Incremental: adds `latitude`, `longitude`, `geocoded_at` to `businesses` for Mapbox map integration |
| `migrations/006_add_category_items_and_icon.sql` | Incremental: adds `items TEXT` and `fa_icon VARCHAR(100)` to `categories`; recreates `businesses_complete` view with `*_category_icons` arrays appended at end |

### Key design decisions

- **PostgreSQL arrays for relationships** — instead of junction tables, `businesses` stores `input_action_ids INTEGER[]`, `tag_ids INTEGER[]`, etc. GIN indexes enable fast array searches.
- **`businesses_complete` view** — joins all array columns to their name strings; this is what `getListings()` queries. Action name arrays are ordered by `business_actions.display_order`.
- **Action name mapping** — `src/lib/actionMapping.ts` maps Airtable action strings to the app's `ActionName` type. `ACTION_ORDER` in `src/lib/getListings.ts` controls the sort order of `allActionNames` on each listing and should mirror `Order for Display` in Airtable.
- **Action UI config** — icon file and color family are now synced from Airtable (`Icon to Use` → `icon_file`, `Colorway` → `colorway`) and read at runtime via `src/lib/getActions.ts`. `ActionsContext` (a React context) provides this config to all client components so `ActionIcon`, dropdowns, and pills are driven by DB data rather than hardcoded constants. To change an icon or color, update the Airtable row and re-sync.
- **`CREATE OR REPLACE VIEW` column ordering** — PostgreSQL does not allow changing or inserting column positions in an existing view. New columns must always be appended at the end of the SELECT list. Inserting a column in the middle causes a fatal error: `cannot change name of view column 'X' to 'Y'`. When recreating `businesses_complete`, always append new columns after the last existing column.
- **`categories.items`** — stored as a comma-separated string in PostgreSQL (mirroring Airtable). `getCategories()` parses them into a lowercased string array. Search matching is done by substring (`item.includes(query)`), not exact match.

---

## Railway Setup

- **Project:** `just-recreation` (ID: `cddc4dce-8969-4302-ac5d-68652cc8e132`)
- **Environments:** `staging`, `production`
- **Services (staging):** `sa-circular-directory-app` (Next.js app), `Postgres`, `airtable-sync` (cron)
- **Services (production):** `sa-circular-directory-app`, `Postgres`
- Env vars managed in Railway dashboard — never committed to the repo

### Dependency note

`airtable` and `tsx` must be in `dependencies` (not `devDependencies`) — Railway strips dev deps during production builds, and both are needed at runtime by the cron service.

---

## Actual Repo Structure

```
sa-circular-directory-app/
  src/
    app/                      # Next.js App Router pages
      DirectoryClient.tsx     # Client wrapper: all filter state (search, actionFilter); single source of truth for filteredListings
      MobileBottomSheet.tsx   # Mobile listing drawer — receives filteredListings from DirectoryClient
      MobileSearchSheet.tsx   # Mobile search/filter bottom sheet with autocomplete and action filter pills
      page.tsx                # Server component: fetches listings + categories in parallel
    components/
      ActionIcon/             # ActionIcon component; exports getActionLabel() and ALL_ACTIONS for use in dropdowns
      MapView/                # Mapbox GL JS map + floating search bar (client component, desktop-primary)
      Nav/                    # Navigation bar
    lib/
      sync.ts                 # Core sync logic: Airtable upsert + Mapbox geocoding
      db.ts                   # pg Pool singleton
      getListings.ts          # DB → Listing type mapping; queries businesses_complete view
      getCategories.ts        # DB → Category[] (category, items[], faIcon); used for search matching
      slugify.ts              # slugify() utility (separate file to avoid client-bundle pg import)
      actionMapping.ts        # Airtable action string → ActionName mapping
  scripts/
    sync.ts                   # Standalone entry point for Railway Cron (calls src/lib/sync.ts)
  migrations/
    002_simplified_schema.sql
    003_add_action_columns.sql
    004_add_geocoding.sql     # Adds latitude, longitude, geocoded_at to businesses
    006_add_category_items_and_icon.sql  # Adds items, fa_icon to categories; updates businesses_complete view
  docs/
    architecture.md           # This file
```

### Environment variables

| Variable | Service | Purpose |
|---|---|---|
| `DATABASE_URL` | All | Railway Postgres connection string |
| `AIRTABLE_API_KEY` | `airtable-sync` cron | Airtable read access |
| `AIRTABLE_BASE_ID` | `airtable-sync` cron | Airtable base (`apppd7CyLPeDWBkLz`) |
| `MAPBOX_SECRET_TOKEN` | `airtable-sync` cron | Server-side geocoding API (never exposed to browser) |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Next.js app | Client-side map rendering (public, safe to expose) |
| `NODE_ENV` | `airtable-sync` cron | Must be `production` to enable SSL on DB connection |

---

## Search & Filtering Architecture

Filtering is computed entirely client-side in `DirectoryClient.tsx` — no search API calls.

### Filter state
`DirectoryClient` owns two filter state values:
- `searchQuery: string` — text entered by user
- `actionFilter: ActionName | null` — selected action pill (Donate, Buy, Repair, etc.)

`filteredListings` is a `useMemo` that applies both filters. All downstream components receive `filteredListings`, never the raw `listings` array.

### Search matching logic
A listing matches a `searchQuery` if **any** of these are true (OR logic):
1. `businessName` contains the query (substring, case-insensitive)
2. `address` contains the query
3. Any of the listing's `inputCategories`, `outputCategories`, or `serviceCategories` names belong to a category whose `items` array contains the query as a substring

Step 3 requires `categories` to be fetched alongside `listings` in `page.tsx` and passed down to `DirectoryClient`.

### Component roles
| Component | Role |
|---|---|
| `DirectoryClient` | Owns `searchQuery`, `actionFilter`, `filteredListings`. Single source of truth. |
| `MapView` | Receives `filteredListings`; toggles `markerHidden` CSS class by diffing against a `visibleIds` Set. Does not compute its own filters. Also owns the desktop search input and action filter dropdown; calls `onSearchChange` / `onActionFilterChange` to update parent state. |
| `MobileBottomSheet` | Receives `filteredListings` directly — no independent filtering. |
| `MobileSearchSheet` | Modal sheet for mobile. Has local draft state (`localSearch`, `localActionFilter`). Computes a live `filteredCount` for the "Show Results (N)" button. On submit, calls `onApply` to push state up to `DirectoryClient`. |

### Autocomplete
Both `MapView` (desktop) and `MobileSearchSheet` (mobile) have autocomplete. Two result types:
- **Business** — matches on `businessName` substring, links directly to that listing
- **Item** — matches on category item strings; selecting one sets the search query and (in MobileSearchSheet) shows a category badge

MapView stores `recentSearches` in component state (session-only, max 5) and shows them when the input is focused but empty. MobileSearchSheet shows at most 5 autocomplete results total.

### Mobile search flow
On mobile (`window.innerWidth < 1024`), tapping the MapView search input blurs it and opens `MobileSearchSheet` instead (via `onMobileSearchOpen` callback). The sheet slides up from the bottom, user sets filters locally, then taps "Show Results" to apply.

---

## Where AI Makes Sense

| Task | AI Opportunity |
|---|---|
| Airtable schema changes | When new columns are added to Airtable, Claude can update the sync script, migration, `getListings.ts` types, and UI in one pass |
| Sync script logic | Claude writes and maintains the upsert logic as Airtable schema evolves |
| QA diffing | Claude can compare staging vs. production record counts / field changes before promotion |
| Component generation | Claude builds UI components from Figma designs using design tokens (see CLAUDE.md) |
| Data cleanup | Claude can flag Airtable records with missing required fields before sync |
| Field name auditing | Use the Airtable MCP (`describe_table`) + Grep to verify field name alignment between Airtable and sync scripts |
