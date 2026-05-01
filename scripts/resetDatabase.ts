import * as fs from 'fs';
import * as path from 'path';
import { end, getClient, testConnection } from './dbConfig';

async function resetDatabase(): Promise<void> {
  console.log('\n⚠️  WARNING: Database Reset\n');
  console.log('================================================');
  console.log('This will PERMANENTLY DELETE all tables and data!');
  console.log('================================================\n');

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set in .env file');
    process.exit(1);
  }

  const connected = await testConnection();
  if (!connected) {
    console.error('❌ Could not connect to database');
    process.exit(1);
  }

  console.log('\n🗑️  Dropping all tables and views...\n');

  const client = await getClient();

  try {
    await client.query('BEGIN');

    const dropScriptPath = path.join(__dirname, '..', 'migrations', 'drop_all_tables.sql');
    const dropScript = fs.readFileSync(dropScriptPath, 'utf8');
    await client.query(dropScript);

    await client.query('COMMIT');

    console.log('✅ All tables and views have been dropped\n');
    console.log('================================================\n');
    console.log('Database has been reset successfully!');
    console.log('Run "npm run migrate:sql" to recreate the schema.');
    console.log('================================================\n');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Reset failed:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error('\n📋 Stack trace:', error.stack);
    }
    throw error;

  } finally {
    client.release();
    await end();
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);

  if (!args.includes('--confirm')) {
    console.error('\n⚠️  SAFETY CHECK: This command requires confirmation\n');
    console.error('To reset the database, run:');
    console.error('  npm run db:reset -- --confirm\n');
    console.error('or');
    console.error('  npx tsx scripts/resetDatabase.ts --confirm\n');
    process.exit(1);
  }

  resetDatabase()
    .then(() => {
      console.log('✅ Done!');
      process.exit(0);
    })
    .catch((error: Error) => {
      console.error('❌ Fatal error:', error.message);
      process.exit(1);
    });
}

export { resetDatabase };
