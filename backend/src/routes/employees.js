/**
 * Employees routes — maps HTTP endpoints to employees controller handlers.
 */

const express = require('express');
const {
  getEmployeeTaskSummary,
  updateEmployeeColor,
} = require('../controllers/employees.controller');

const router = express.Router();

/* GET /employees — employee task summary (via app mount) */
router.get('/', getEmployeeTaskSummary);

/* PATCH /employees/:id/color — update employee dashboard color */
router.patch('/:id/color', updateEmployeeColor);

module.exports = router;
