/**
 * Jest global teardown — closes the MSSQL connection pool after all tests.
 */

module.exports = async () => {
  const { poolPromise } = require('../src/db/connection');
  const pool = await poolPromise;
  await pool.close();
};
