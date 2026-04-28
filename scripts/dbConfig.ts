import 'dotenv/config'; // ES module import, no require() needed
import { Pool } from 'pg';

/**
 * PostgreSQL connection pool configuration
 * Uses DATABASE_URL from .env
 */
export interface PoolConfig {
  connectionString: string;
  ssl?: boolean | { rejectUnauthorized: false };
  max: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
}

export const pool = new Pool({
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
 * @param text - SQL query text
 * @param params - Query parameters
 * @returns Promise resolving to pg query result
 */
export async function query(
  text: string,
  params?: any[]
): Promise<any> {
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
 * @returns Promise resolving to database client
 */
export async function getClient(): Promise<any> {
  const client = await pool.connect();

  // Add query method with logging
  const originalQuery = client.query.bind(client);
  
  (client as any).query = async (text: string, params?: any[]): Promise<any> => {
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
export async function end(): Promise<void> {
  await pool.end();
}

/**
 * Test database connection
 * @returns True if connection successful, false otherwise
 */
export async function testConnection(): Promise<boolean> {
  try {
    const result = await query(
      'SELECT NOW() as current_time, version() as postgres_version'
    );
    
    console.log('✅ Database connection successful');
    console.log('   Time:', result.rows[0].current_time);
    console.log(
      '   PostgreSQL:',
      result.rows[0].postgres_version.split(' ')[0],
      result.rows[0].postgres_version.split(' ')[1]
    );
    return true;
  } catch (error: any) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}
