#!/usr/bin/env bash
set -euo pipefail
npx tsx scripts/runMigrations.ts
node scripts/promote-db.js
