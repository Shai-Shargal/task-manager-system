/**
 * Employees routes — maps HTTP endpoints to employees controller handlers.
 */

const express = require('express');
const { getEmployeeTaskSummary } = require('../controllers/employees.controller');

const router = express.Router();

/* GET /employees — employee task summary (via app mount) */
router.get('/', getEmployeeTaskSummary);

module.exports = router;
