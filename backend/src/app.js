/**
 * Employee Task Manager API — Express application entry point.
 */

const path = require('path');
const express = require('express');
const cors = require('cors');

/* Load environment variables (PORT, DB_*, etc.) */
require('dotenv').config({
  path: path.join(__dirname, '../.env'),
});

/* Initialize MSSQL connection pool on startup */
require('./db/connection');

const employeeRoutes = require('./routes/employees');
const taskRoutes = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 5000;

/* Middleware */
app.use(cors());
app.use(express.json());

/* Health check */
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

/* API routes */
app.use('/employees', employeeRoutes);
app.use('/tasks', taskRoutes);

/* Start server */
app.listen(PORT, () => {
  console.log(`Employee Task Manager API listening on port ${PORT}`);
});
