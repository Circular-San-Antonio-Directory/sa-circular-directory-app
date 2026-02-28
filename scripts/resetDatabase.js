require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { getClient, testConnection, end } = require('./dbConfig');

/**
 * Drop all tables and views from the database
 */
async function resetDatabase() {
  console.log('\n⚠️  WARNING: Database Reset\n');
  console.log('================================================');
  console.log('This will PERMANENTLY DELETE all tables and data!');
  console.log('================================================\n');

  // Validate DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set in .env file');
    process.exit(1);
  }

  // Test connection
  const connected = await testConnection();
  if (!connected) {
    console.error('❌ Could not connect to database');
    process.exit(1);
  }

  console.log('\n🗑️  Dropping all tables and views...\n');

  const client = await getClient();

  try {
    // Start transaction
    await client.query('BEGIN');

    // Read and execute drop script
    const dropScriptPath = path.join(__dirname, '..', 'migrations', 'drop_all_tables.sql');
    const dropScript = fs.readFileSync(dropScriptPath, 'utf8');

    await client.query(dropScript);

    // Commit transaction
    await client.query('COMMIT');

    console.log('✅ All tables and views have been dropped\n');
    console.log('================================================\n');
    console.log('Database has been reset successfully!');
    console.log('Run "npm run migrate:sql" to recreate the schema.');
    console.log('================================================\n');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Reset failed:', error.message);
    console.error('\n📋 Stack trace:', error.stack);
    throw error;

  } finally {
    client.release();
    await end();
  }
}

// Check if running directly and require confirmation
if (require.main === module) {
  const args = process.argv.slice(2);

  if (!args.includes('--confirm')) {
    console.error('\n⚠️  SAFETY CHECK: This command requires confirmation\n');
    console.error('To reset the database, run:');
    console.error('  npm run db:reset -- --confirm\n');
    console.error('or');
    console.error('  node scripts/resetDatabase.js --confirm\n');
    process.exit(1);
  }

  resetDatabase()
    .then(() => {
      console.log('✅ Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Fatal error:', error.message);
      process.exit(1);
    });
}

module.exports = { resetDatabase };
