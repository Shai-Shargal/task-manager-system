/**
 * Employees controller — handles employee-related API operations.
 * All database access uses stored procedures only.
 */

const { poolPromise, sql } = require('../db/connection');

const COLOR_HEX_PATTERN = /^#[0-9A-Fa-f]{6}$/;

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

/**
 * PATCH /employees/:id/color
 * Executes usp_UpdateEmployeeColor.
 */
async function updateEmployeeColor(req, res) {
  try {
    const employeeId = parseInt(req.params.id, 10);
    const { colorHex } = req.body;

    if (Number.isNaN(employeeId)) {
      return res.status(400).json({ message: 'Employee id must be a valid number.' });
    }

    if (!colorHex || !COLOR_HEX_PATTERN.test(colorHex.trim())) {
      return res.status(400).json({
        message: 'colorHex must be a valid hex color (e.g. #3B82F6).',
      });
    }

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('EmployeeID', sql.Int, employeeId)
      .input('ColorHex', sql.VarChar(20), colorHex.trim())
      .execute('usp_UpdateEmployeeColor');

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('updateEmployeeColor error:', err.message);
    const notFound = /employee not found/i.test(err.message || '');
    res.status(notFound ? 404 : 500).json({
      message: err.message || 'Failed to update employee color',
    });
  }
}

module.exports = {
  getEmployeeTaskSummary,
  updateEmployeeColor,
};
