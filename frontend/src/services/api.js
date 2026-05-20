/**
 * API service — axios client for the Employee Task Manager backend.
 */

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001',
});

/**
 * Fetches employee task summaries from the API.
 * @returns {Promise<Array>} Employee summary rows from GET /employees
 */
export async function getEmployees() {
  try {
    const response = await api.get('/employees');
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message || error.message || 'Failed to fetch employees';
    console.error('getEmployees error:', message);
    throw new Error(message);
  }
}

/**
 * Fetches all tasks with employee and department details.
 * @returns {Promise<Array>} Task rows from GET /tasks
 */
export async function getTasks() {
  try {
    const response = await api.get('/tasks');
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message || error.message || 'Failed to fetch tasks';
    console.error('getTasks error:', message);
    throw new Error(message);
  }
}

/**
 * Updates a task status via PATCH /tasks/:id/status.
 * @param {number} taskId
 * @param {string} status - Pending | In Progress | Done
 * @returns {Promise<{ message: string, task_id: number, status: string }>}
 */
export async function updateTaskStatus(taskId, status) {
  try {
    const response = await api.patch(`/tasks/${taskId}/status`, { status });
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message || error.message || 'Failed to update task status';
    if (!message.includes('Invalid status transition')) {
      console.error('updateTaskStatus error:', message);
    }
    throw new Error(message);
  }
}
