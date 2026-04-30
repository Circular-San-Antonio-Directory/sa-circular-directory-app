#!/usr/bin/env bash
set -euo pipefail

echo "=== DB Promotion: staging → production ==="
echo "Tag: ${RAILWAY_GIT_COMMIT_SHA:-unknown}"
echo "Started at: $(date -u '+%Y-%m-%dT%H:%M:%SZ')"

if [[ -z "${STAGING_DB_URL:-}" ]]; then
  echo "ERROR: STAGING_DB_URL is not set" >&2; exit 1
fi
if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "ERROR: DATABASE_URL is not set" >&2; exit 1
fi

echo "Step 1/2: Dumping staging database..."
pg_dump \
  --no-owner \
  --no-acl \
  --format=custom \
  "${STAGING_DB_URL}" \
  > /tmp/staging_dump.pgdump

echo "Dump complete. Size: $(du -sh /tmp/staging_dump.pgdump | cut -f1)"

echo "Step 2/2: Restoring to production database..."
pg_restore \
  --no-owner \
  --no-acl \
  --clean \
  --if-exists \
  --single-transaction \
  --dbname="${DATABASE_URL}" \
  /tmp/staging_dump.pgdump

echo "=== Promotion complete at $(date -u '+%Y-%m-%dT%H:%M:%SZ') ==="
