#!/usr/bin/env bash
set -euo pipefail
node scripts/runMigrations.js
node scripts/promote-db.js
