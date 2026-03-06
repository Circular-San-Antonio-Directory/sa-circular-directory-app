import 'dotenv/config';
import { runSync } from '../src/lib/sync';
import pool from '../src/lib/db';

async function main() {
  console.log(`[sync] Starting Airtable → PostgreSQL sync at ${new Date().toISOString()}`);

  try {
    const result = await runSync();
    console.log('[sync] Sync complete:', JSON.stringify(result, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('[sync] Sync failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
