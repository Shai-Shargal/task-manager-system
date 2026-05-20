/**
 * MSSQL database connection module.
 *
 * Loads environment variables, validates configuration, and exposes a shared
 * ConnectionPool promise for stored procedure execution across the API.
 */

const path = require('path');
const sql = require('mssql');
require('dotenv').config({
  path: path.join(__dirname, '../../.env'),
});

const REQUIRED_ENV_VARS = [
  'DB_USER',
  'DB_PASSWORD',
  'DB_SERVER',
  'DB_PORT',
  'DB_NAME',
];

/**
 * Returns a required environment variable or throws if missing.
 * @param {string} name
 * @returns {string}
 */
function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

/* Validate all required variables before building the pool config */
REQUIRED_ENV_VARS.forEach(getRequiredEnv);

const config = {
  user: getRequiredEnv('DB_USER'),
  password: getRequiredEnv('DB_PASSWORD'),
  server: getRequiredEnv('DB_SERVER'),
  port: parseInt(getRequiredEnv('DB_PORT'), 10),
  database: getRequiredEnv('DB_NAME'),
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

/**
 * Creates and connects the shared MSSQL connection pool.
 * @returns {Promise<sql.ConnectionPool>}
 */
async function connectDatabase() {
  try {
    const pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log(`Connected to MSSQL database: ${config.database}`);
    return pool;
  } catch (err) {
    console.error('Database connection failed:', err.message);
    throw err;
  }
}

/* Singleton pool promise — importers await this once per process */
const poolPromise = connectDatabase();

module.exports = {
  sql,
  poolPromise,
};
