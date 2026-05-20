/**
 * Tasks controller — handles task-related API operations.
 * All database access uses stored procedures only.
 */

const { poolPromise, sql } = require('../db/connection');

/**
 * GET /tasks
 * Executes usp_GetAllTasks and returns all tasks with employee and department details.
 */
async function getAllTasks(req, res) {
  try {
    const pool = await poolPromise;
    const result = await pool.request().execute('usp_GetAllTasks');

    res.json(result.recordset);
  } catch (err) {
    console.error('getAllTasks error:', err.message);
    res.status(500).json({
      message: 'Failed to fetch tasks',
    });
  }
}

/**
 * PATCH /tasks/:id/status
 * Executes usp_UpdateTaskStatus with forward-only status transition rules.
 */
async function updateTaskStatus(req, res) {
  try {
    const taskId = parseInt(req.params.id, 10);
    const status = req.body.status;

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('TaskID', sql.Int, taskId)
      .input('NewStatus', sql.VarChar(20), status)
      .execute('usp_UpdateTaskStatus');

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('updateTaskStatus error:', err.message);
    res.status(500).json({
      message: err.message || 'Failed to update task status',
    });
  }
}

module.exports = {
  getAllTasks,
  updateTaskStatus,
};
