'use strict';

const { Pool } = require('pg');

if (!process.env.STAGING_DB_URL) {
  console.error('ERROR: STAGING_DB_URL is not set');
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL is not set');
  process.exit(1);
}

const staging = new Pool({
  connectionString: process.env.STAGING_DB_URL,
  ssl: { rejectUnauthorized: false },
});

const prod = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function promote() {
  console.log('=== DB Promotion: staging → production ===');
  console.log(`Started at: ${new Date().toISOString()}`);

  const { rows: tables } = await staging.query(`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename
  `);

  console.log(`Tables: ${tables.map(t => t.tablename).join(', ')}\n`);

  for (const { tablename } of tables) {
    process.stdout.write(`Copying ${tablename}... `);

    const { rows } = await staging.query(`SELECT * FROM "${tablename}"`);
    await prod.query(`TRUNCATE "${tablename}" CASCADE`);

    if (rows.length === 0) {
      console.log('empty');
      continue;
    }

    const columns = Object.keys(rows[0]);
    const columnList = columns.map(c => `"${c}"`).join(', ');

    for (const row of rows) {
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
      await prod.query(
        `INSERT INTO "${tablename}" (${columnList}) VALUES (${placeholders})`,
        columns.map(c => row[c])
      );
    }

    console.log(`${rows.length} rows`);
  }

  // Reset sequences to match staging
  const { rows: sequences } = await staging.query(`
    SELECT sequence_name FROM information_schema.sequences
    WHERE sequence_schema = 'public'
  `);

  for (const { sequence_name } of sequences) {
    const { rows: [seq] } = await staging.query(`SELECT last_value FROM "${sequence_name}"`);
    await prod.query(`SELECT setval($1, $2, true)`, [sequence_name, seq.last_value]);
    console.log(`Sequence ${sequence_name} → ${seq.last_value}`);
  }

  console.log(`\n=== Promotion complete at ${new Date().toISOString()} ===`);
}

promote()
  .catch(err => {
    console.error('\nPromotion FAILED:', err.message);
    process.exit(1);
  })
  .finally(() => Promise.all([staging.end(), prod.end()]));
