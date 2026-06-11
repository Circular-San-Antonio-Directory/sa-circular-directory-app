# SA Circular Directory

**v1.1.7** — A web directory of circular economy businesses in San Antonio, helping residents find places to donate, buy secondhand, repair, and exchange items.

Data is managed in Airtable and synced to a PostgreSQL database. The Next.js app reads from Postgres and renders an interactive map + filterable directory.

---

## Tech Stack

- **Next.js 14** (App Router) + TypeScript
- **PostgreSQL + PostGIS** — app database (hosted on Railway)
- **Prisma** — ORM and migrations
- **Airtable** — source of truth for all business data (read-only from app)
- **Mapbox GL JS** — interactive map
- **SCSS modules** — component-scoped styles with shared design tokens
- **Vitest + React Testing Library** — unit and component tests
- **Railway** — hosting and managed Postgres

---

## Prerequisites

- Node.js 22+
- npm 10+
- A PostgreSQL database (local or Railway)
- Airtable access (for sync only)
- Mapbox account (for map rendering and geocoding)

---

## Local Setup

```bash
git clone <repo-url>
cd sa-circular-directory-app
npm install

cp .env.example .env.local
# fill in the required values (see Environment Variables below)

npx prisma migrate dev
npm run dev
```

App runs at [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable | Required for | Where to get it |
|---|---|---|
| `DATABASE_URL` | App + Sync | Railway Postgres connection string |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | App | Mapbox dashboard — public token |
| `NEXT_PUBLIC_SITE_URL` | App | Full canonical URL, e.g. `https://directory.circularsanantonio.org` |
| `AIRTABLE_API_KEY` | Sync only | Airtable personal access token |
| `AIRTABLE_BASE_ID` | Sync only | `apppd7CyLPeDWBkLz` |
| `MAPBOX_SECRET_TOKEN` | Sync only | Mapbox dashboard — secret token (server-side geocoding) |

See `.env.example` for descriptions and all optional variables.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server at localhost:3000 |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm test` | Run all tests |
| `npm run test:watch` | Watch mode |
| `npm run lint` | ESLint check |
| `npm run sync` | Fetch from Airtable and upsert into Postgres |
| `npm run db:reset` | Clear all data from the database |
| `npm run db:promote` | Promote staging DB to production (`pg_dump` → `pg_restore`) |

---

## Data Pipeline

**Airtable → sync script → PostgreSQL → Next.js app**

The sync script (`scripts/sync.ts`) reads from Airtable, validates records against Zod schemas, geocodes new addresses via Mapbox, and upserts everything into Postgres. It is idempotent — safe to run multiple times.

Sync runs automatically via a Railway cron job at **6am UTC daily**. It can also be triggered manually:

```bash
npm run sync                         # local (uses .env.local)
POST /api/admin/sync                 # HTTP trigger on the deployed app
```

---

## Deployment

| | Staging | Production |
|---|---|---|
| **Trigger** | Push to `main` | Merge `main` → `production` branch |
| **Auto-deploy** | Yes (Railway watches `main`) | Yes (Railway watches `production`) |
| **DB** | Staging Postgres | Production Postgres |
| **Data sync** | Daily cron + manual | Promoted from staging |
| **URL** | `https://s-directory.circularsanantonio.org` | `https://directory.circularsanantonio.org` |

Before production deploys, `scripts/promote-db.sh` runs automatically to copy the staging database to production (~30s downtime during restore).

---

## Branching

Never commit directly to `main`. Always work on a branch:

```bash
git checkout -b feature/short-description   # new features
git checkout -b fix/short-description       # bug fixes
```

Open a PR targeting `main`. Staging deploys on merge.

---

## Versioning

After any user-facing change, bug fix, or API/data-layer modification, update **both**:

1. `package.json` → `version` (semver: patch / minor / major)
2. `CHANGELOG.md` → prepend a new entry

Skip version bumps for internal refactors, comment/doc updates, CI changes, or WIP commits.

---

## Testing

```bash
npm test          # run all tests
npm run test:watch
```

Coverage is enforced at **85%** in CI. Tests are colocated with components in `__tests__/` directories.

All `.test.tsx` files must include `// @vitest-environment jsdom` as the first line — the global vitest config defaults to `node`, and `environmentMatchGlobs` doesn't work with `[slug]` path segments.

---

## Further Reading

- [`docs/architecture.md`](docs/architecture.md) — full system architecture, data flow, and design decisions
- [`docs/STRUCTURED_DATA.md`](docs/STRUCTURED_DATA.md) — JSON-LD / SEO structured data implementation
- [`docs/adding-business-actions.md`](docs/adding-business-actions.md) — how to add new action types (Donate, Repair, etc.)
- [`docs/hours-functionality.md`](docs/hours-functionality.md) — business hours display logic
