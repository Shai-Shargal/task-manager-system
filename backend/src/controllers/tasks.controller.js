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

/**
 * POST /tasks
 * Executes usp_CreateTask — new tasks always start as Pending.
 */
async function createTask(req, res) {
  try {
    const { title, description, assignedTo, dueDate } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ message: 'Title is required.' });
    }

    if (assignedTo === undefined || assignedTo === null || assignedTo === '') {
      return res.status(400).json({ message: 'assignedTo is required.' });
    }

    if (!dueDate) {
      return res.status(400).json({ message: 'dueDate is required.' });
    }

    const employeeId = parseInt(assignedTo, 10);
    if (Number.isNaN(employeeId)) {
      return res.status(400).json({ message: 'assignedTo must be a valid employee id.' });
    }

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('Title', sql.VarChar(200), title.trim())
      .input('Description', sql.VarChar(sql.MAX), description || null)
      .input('AssignedTo', sql.Int, employeeId)
      .input('DueDate', sql.DateTime, new Date(dueDate))
      .execute('usp_CreateTask');

    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error('createTask error:', err.message);
    res.status(500).json({
      message: err.message || 'Failed to create task',
    });
  }
}

/**
 * DELETE /tasks/:id
 * Executes usp_DeleteTask — permanently removes a task.
 */
async function deleteTask(req, res) {
  try {
    const taskId = parseInt(req.params.id, 10);

    if (Number.isNaN(taskId)) {
      return res.status(400).json({ message: 'Task id must be a valid number.' });
    }

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('TaskID', sql.Int, taskId)
      .execute('usp_DeleteTask');

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('deleteTask error:', err.message);
    const notFound = /task not found/i.test(err.message || '');
    res.status(notFound ? 404 : 500).json({
      message: err.message || 'Failed to delete task',
    });
  }
}

/**
 * PUT /tasks/:id
 * Executes usp_UpdateTaskDetails — does not change status or created_at.
 */
async function updateTaskDetails(req, res) {
  try {
    const taskId = parseInt(req.params.id, 10);
    const { title, description, assignedTo, dueDate } = req.body;

    if (Number.isNaN(taskId)) {
      return res.status(400).json({ message: 'Task id must be a valid number.' });
    }

    if (!title || title.trim() === '') {
      return res.status(400).json({ message: 'Title is required.' });
    }

    if (assignedTo === undefined || assignedTo === null || assignedTo === '') {
      return res.status(400).json({ message: 'assignedTo is required.' });
    }

    if (!dueDate) {
      return res.status(400).json({ message: 'dueDate is required.' });
    }

    const employeeId = parseInt(assignedTo, 10);
    if (Number.isNaN(employeeId)) {
      return res.status(400).json({ message: 'assignedTo must be a valid employee id.' });
    }

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('TaskID', sql.Int, taskId)
      .input('Title', sql.VarChar(200), title.trim())
      .input('Description', sql.VarChar(sql.MAX), description || null)
      .input('AssignedTo', sql.Int, employeeId)
      .input('DueDate', sql.DateTime, new Date(dueDate))
      .execute('usp_UpdateTaskDetails');

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('updateTaskDetails error:', err.message);
    const notFound = /task not found/i.test(err.message || '');
    res.status(notFound ? 404 : 500).json({
      message: err.message || 'Failed to update task',
    });
  }
}

module.exports = {
  getAllTasks,
  updateTaskStatus,
  createTask,
  deleteTask,
  updateTaskDetails,
};
