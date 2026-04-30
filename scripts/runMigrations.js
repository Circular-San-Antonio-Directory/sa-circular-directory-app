'use strict';

const fs = require('fs');
const path = require('path');
const { getClient, testConnection, end } = require('./dbConfig');

const MIGRATIONS_DIR = path.resolve(__dirname, '../migrations');
const MIGRATION_PATTERN = /^\d{3}_.*\.sql$/;

async function runMigrations() {
  const connected = await testConnection();
  if (!connected) {
    console.error('Could not connect to database');
    process.exit(1);
  }

  const client = await getClient();

  try {
    // Ensure tracking table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name VARCHAR NOT NULL PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Find applied migrations
    const { rows: applied } = await client.query('SELECT name FROM schema_migrations');
    const appliedSet = new Set(applied.map(r => r.name));

    // Find pending migrations (numbered files only, sorted)
    const pending = fs.readdirSync(MIGRATIONS_DIR)
      .filter(f => MIGRATION_PATTERN.test(f))
      .sort()
      .filter(f => !appliedSet.has(f));

    if (pending.length === 0) {
      console.log('✅ No pending migrations');
      return;
    }

    console.log(`Running ${pending.length} pending migration(s)...`);

    for (const filename of pending) {
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, filename), 'utf8');

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [filename]);
        await client.query('COMMIT');
        console.log(`  ✅ Applied: ${filename}`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`  ❌ Failed: ${filename} — ${err.message}`);
        process.exit(1);
      }
    }
  } finally {
    client.release();
    await end();
  }
}

runMigrations();
