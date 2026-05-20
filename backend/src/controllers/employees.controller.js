/**
 * Employees controller — handles employee-related API operations.
 * All database access uses stored procedures only.
 */

const { poolPromise } = require('../db/connection');

/**
 * GET /employees
 * Executes usp_GetEmployeeTaskSummary and returns employee task statistics.
 */
async function getEmployeeTaskSummary(req, res) {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .execute('usp_GetEmployeeTaskSummary');

    res.json(result.recordset);
  } catch (err) {
    console.error('getEmployeeTaskSummary error:', err.message);
    res.status(500).json({
      message: 'Failed to fetch employee task summary',
    });
  }
}

module.exports = {
  getEmployeeTaskSummary,
};
