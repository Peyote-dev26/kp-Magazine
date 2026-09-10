const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'kp_magazines',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    return result.rows[0];
  } catch (error) {
    console.warn('Database connection unavailable. Falling back to in-memory data store.');
    return null;
  }
}

module.exports = {
  pool,
  testConnection,
};
