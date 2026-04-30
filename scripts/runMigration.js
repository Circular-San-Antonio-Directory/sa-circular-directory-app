'use strict';

const fs = require('fs');
const path = require('path');
const { getClient, testConnection, end } = require('./dbConfig');

async function runMigration() {
  const migrationFile = process.argv[2];

  if (!migrationFile) {
    console.error('Usage: node scripts/runMigration.js <path-to-migration.sql>');
    process.exit(1);
  }

  const absolutePath = path.resolve(migrationFile);

  if (!fs.existsSync(absolutePath)) {
    console.error(`Migration file not found: ${absolutePath}`);
    process.exit(1);
  }

  const connected = await testConnection();
  if (!connected) {
    console.error('Could not connect to database');
    process.exit(1);
  }

  const sql = fs.readFileSync(absolutePath, 'utf8');
  const client = await getClient();

  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log(`✅ Migration applied: ${path.basename(absolutePath)}`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed — rolled back:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await end();
  }
}

runMigration();
