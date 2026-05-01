require('dotenv').config();
const { Pool } = require('pg');

/**
 * PostgreSQL connection pool configuration
 * Uses DATABASE_URL from .env
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

/**
 * Execute a query
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @returns {Promise} - Query result
 */
async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;

  if (process.env.DEBUG_SQL) {
    console.log('Executed query', { text, duration, rows: res.rowCount });
  }

  return res;
}

/**
 * Get a client from the pool for transactions
 * @returns {Promise} - Database client
 */
async function getClient() {
  const client = await pool.connect();

  // Add query method with logging
  const originalQuery = client.query.bind(client);
  client.query = async (text, params) => {
    const start = Date.now();
    const res = await originalQuery(text, params);
    const duration = Date.now() - start;

    if (process.env.DEBUG_SQL) {
      console.log('Executed query', { text, duration, rows: res.rowCount });
    }

    return res;
  };

  return client;
}

/**
 * Close all connections in the pool
 */
async function end() {
  await pool.end();
}

/**
 * Test database connection
 * @returns {Promise<boolean>} - True if connection successful
 */
async function testConnection() {
  try {
    const result = await query('SELECT NOW() as current_time, version() as postgres_version');
    console.log('✅ Database connection successful');
    console.log('   Time:', result.rows[0].current_time);
    console.log('   PostgreSQL:', result.rows[0].postgres_version.split(' ')[0], result.rows[0].postgres_version.split(' ')[1]);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

module.exports = {
  query,
  getClient,
  end,
  testConnection,
  pool
};
