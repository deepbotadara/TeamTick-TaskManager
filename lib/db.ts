import mysql from 'mysql2/promise';

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'todo_list',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

/**
 * Execute a database query
 * @param query SQL query string
 * @param params Query parameters
 * @returns Query results
 */
export async function query<T = any>(query: string, params?: any[]): Promise<T> {
  try {
    const [results] = await pool.execute(query, params);
    return results as T;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Execute a database query and return the first row
 * @param query SQL query string
 * @param params Query parameters
 * @returns First row or null
 */
export async function queryOne<T = any>(query: string, params?: any[]): Promise<T | null> {
  try {
    const [results] = await pool.execute(query, params);
    const rows = results as T[];
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Get a connection from the pool for transactions
 */
export async function getConnection() {
  return await pool.getConnection();
}

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

export default pool;
