/**
 * Tasks routes — maps HTTP endpoints to tasks controller handlers.
 */

const express = require('express');
const { getAllTasks, updateTaskStatus } = require('../controllers/tasks.controller');

const router = express.Router();

/* GET /tasks — all tasks with employee and department details */
router.get('/', getAllTasks);

/* PATCH /tasks/:id/status — update task status with transition rules */
router.patch('/:id/status', updateTaskStatus);

module.exports = router;
