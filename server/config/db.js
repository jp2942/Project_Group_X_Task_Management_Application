const { Pool } = require('pg');
require('dotenv').config();

// Build pool configuration from DATABASE_URL or individual environment variables
const poolConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'task_management',
      password: process.env.DB_PASSWORD || '',
      port: parseInt(process.env.DB_PORT || '5432', 10),
    };

// Initialize PostgreSQL connection pool
const pool = new Pool(poolConfig);

// Log any unexpected error on idle pool clients
pool.on('error', (err) => {
  console.error('Unexpected error on idle database client:', err.message);
});

// Export helper to execute parameterized queries
module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
